let headers = ["Brand","ShipsFrom","SoldBy","TotalSellers","ASIN","BSR Rank","Category","Price","Bought30d","Rating","Reviews","Note","Status"];
let currentData = null;
let filterStatus = {
  bsr: null,
  reviews: null,
  sellers: null,
  rating: null,
  bought: null,
  price: null,
  brandSoldBy: null
};

// Toggle filters visibility
document.getElementById("filtersToggle").addEventListener("click", function() {
  const filterSection = document.getElementById("filterSection");
  const filterArrow = document.getElementById("filterArrow");
  const filterText = this.querySelector("span:first-child");
  const isVisible = filterSection.style.display === "block";
  
  filterSection.style.display = isVisible ? "none" : "block";
  filterText.textContent = isVisible ? "Show Filters" : "Hide Filters";
  filterArrow.className = isVisible ? "arrow arrow-down" : "arrow arrow-up";
});

// Load saved filters
chrome.storage.local.get({
  filters: {
    bsrMin: "", bsrMax: "",
    reviewsMin: "", reviewsMax: "",
    sellersMin: "", sellersMax: "",
    ratingMin: "", ratingMax: "",
    boughtMin: "", boughtMax: "",
    priceMin: "", priceMax: ""
  }
}, (data) => {
  const filters = data.filters;
  document.getElementById("bsrMin").value = filters.bsrMin;
  document.getElementById("bsrMax").value = filters.bsrMax;
  document.getElementById("reviewsMin").value = filters.reviewsMin;
  document.getElementById("reviewsMax").value = filters.reviewsMax;
  document.getElementById("sellersMin").value = filters.sellersMin;
  document.getElementById("sellersMax").value = filters.sellersMax;
  document.getElementById("ratingMin").value = filters.ratingMin;
  document.getElementById("ratingMax").value = filters.ratingMax;
  document.getElementById("boughtMin").value = filters.boughtMin;
  document.getElementById("boughtMax").value = filters.boughtMax;
  document.getElementById("priceMin").value = filters.priceMin;
  document.getElementById("priceMax").value = filters.priceMax;
});

// Get product data when popup opens
function getProductData() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs[0]) {
            document.getElementById("shipsFrom").textContent = "No active tab";
            return;
        }

        // Check if we're on an Amazon page
        if (!tabs[0].url.includes("amazon")) {
            document.getElementById("shipsFrom").textContent = "Please navigate to an Amazon product page";
            return;
        }

        // Send message to content script
        chrome.tabs.sendMessage(tabs[0].id, { action: "getSeller" }, (response) => {
            if (chrome.runtime.lastError) {
                console.error("Error:", chrome.runtime.lastError);
                document.getElementById("shipsFrom").textContent = "Error loading data. Refresh page and try again.";
                return;
            }
            
            if (response) {
                processResponse(response);
            } else {
                document.getElementById("shipsFrom").textContent = "No data received. Refresh page and try again.";
            }
        });
    });
}

// Process the response from content script
function processResponse(response) {
    console.log("Processing response:", response);
    currentData = response;
    
    // Update UI with response data
    document.getElementById("brand").textContent = response.brand;
    document.getElementById("shipsFrom").textContent = response.shipsFrom;
    document.getElementById("soldBy").textContent = response.soldBy;
    document.getElementById("totalSellers").textContent = response.totalSellers;
    document.getElementById("asin").textContent = response.asin;
    document.getElementById("bsrRank").textContent = response.bsrRank;
    document.getElementById("price").textContent = response.price;
    document.getElementById("boughtInPastMonth").textContent = response.boughtInPastMonth;
    document.getElementById("rating").textContent = response.rating;
    document.getElementById("reviewCount").textContent = response.reviewCount;

    // Brand vs SoldBy logic
    let note = "";
    let brandElem = document.getElementById("brand");
    let soldByElem = document.getElementById("soldBy");

    if (response.soldBy.toLowerCase().includes("amazon")) {
        soldByElem.className = "red";
        brandElem.className = "red";
        note = "Amazon is selling";
        filterStatus.brandSoldBy = "red";
    } else if (
        response.brand !== "Not found" &&
        response.soldBy.toLowerCase().includes(response.brand.toLowerCase())
    ) {
        soldByElem.className = "red";
        brandElem.className = "red";
        note = response.brand + " (brand) is selling the product";
        filterStatus.brandSoldBy = "red";
    } else {
        soldByElem.className = "green";
        brandElem.className = "green";
        note = "Brand and Sold By are different.";
        filterStatus.brandSoldBy = "green";
    }
    document.getElementById("note").textContent = note;

    // Apply filters
    applyFilters();
}

// Set up button event listeners
document.getElementById("addRow").addEventListener("click", addRowToStorage);
document.getElementById("exportCsv").addEventListener("click", exportToCSV);
document.getElementById("applyFilters").addEventListener("click", saveAndApplyFilters);

function addRowToStorage() {
  if (!currentData) return;
  
  chrome.storage.local.get({ csvRows: [] }, (data) => {
    let rows = data.csvRows;
    let row = [
      currentData.brand,
      currentData.shipsFrom,
      currentData.soldBy,
      currentData.totalSellers,
      currentData.asin,
      currentData.bsrRank,
      currentData.category,
      currentData.price,
      currentData.boughtInPastMonth,
      currentData.rating,
      currentData.reviewCount,
      document.getElementById("note").textContent,
      document.getElementById("status").textContent.replace("Status: ", "")
    ];
    rows.push(row);
    chrome.storage.local.set({ csvRows: rows }, () => {
      alert("Row added to storage");
    });
  });
}

function exportToCSV() {
  chrome.storage.local.get({ csvRows: [] }, (data) => {
    let rows = data.csvRows;
    if (rows.length === 0) {
      alert("No rows to export yet.");
      return;
    }
    let csvContent = [headers, ...rows]
      .map(r => r.map(x => `"${x}"`).join(","))
      .join("\n");

    let blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    let url = URL.createObjectURL(blob);
    let link = document.createElement("a");
    link.href = url;
    link.download = "amazon_products.csv";
    link.click();
  });
}

function saveAndApplyFilters() {
  // Save filters
  const filters = {
    bsrMin: document.getElementById("bsrMin").value,
    bsrMax: document.getElementById("bsrMax").value,
    reviewsMin: document.getElementById("reviewsMin").value,
    reviewsMax: document.getElementById("reviewsMax").value,
    sellersMin: document.getElementById("sellersMin").value,
    sellersMax: document.getElementById("sellersMax").value,
    ratingMin: document.getElementById("ratingMin").value,
    ratingMax: document.getElementById("ratingMax").value,
    boughtMin: document.getElementById("boughtMin").value,
    boughtMax: document.getElementById("boughtMax").value,
    priceMin: document.getElementById("priceMin").value,
    priceMax: document.getElementById("priceMax").value
  };
  
  chrome.storage.local.set({ filters }, () => {
    applyFilters();
  });
}

function applyFilters() {
  if (!currentData) return;
  
  const filters = {
    bsrMin: document.getElementById("bsrMin").value,
    bsrMax: document.getElementById("bsrMax").value,
    reviewsMin: document.getElementById("reviewsMin").value,
    reviewsMax: document.getElementById("reviewsMax").value,
    sellersMin: document.getElementById("sellersMin").value,
    sellersMax: document.getElementById("sellersMax").value,
    ratingMin: document.getElementById("ratingMin").value,
    ratingMax: document.getElementById("ratingMax").value,
    boughtMin: document.getElementById("boughtMin").value,
    boughtMax: document.getElementById("boughtMax").value,
    priceMin: document.getElementById("priceMin").value,
    priceMax: document.getElementById("priceMax").value
  };
  
  // Reset all filter statuses
  filterStatus = {
    bsr: null,
    reviews: null,
    sellers: null,
    rating: null,
    bought: null,
    price: null,
    brandSoldBy: filterStatus.brandSoldBy
  };
  
  // Apply BSR filter
  const bsrRank = parseInt(currentData.bsrRank.replace(/,/g, '')) || 0;
  if (filters.bsrMin && bsrRank < parseInt(filters.bsrMin)) {
    document.getElementById("bsrRank").className = "red";
    filterStatus.bsr = "red";
  } else if (filters.bsrMax && bsrRank > parseInt(filters.bsrMax)) {
    document.getElementById("bsrRank").className = "red";
    filterStatus.bsr = "red";
  } else if (filters.bsrMin || filters.bsrMax) {
    document.getElementById("bsrRank").className = "green";
    filterStatus.bsr = "green";
  }
  
  // Apply Reviews filter
  const reviews = parseInt(currentData.reviewCount.replace(/,/g, '')) || 0;
  if (filters.reviewsMin && reviews < parseInt(filters.reviewsMin)) {
    document.getElementById("reviewCount").className = "red";
    filterStatus.reviews = "red";
  } else if (filters.reviewsMax && reviews > parseInt(filters.reviewsMax)) {
    document.getElementById("reviewCount").className = "red";
    filterStatus.reviews = "red";
  } else if (filters.reviewsMin || filters.reviewsMax) {
    document.getElementById("reviewCount").className = "green";
    filterStatus.reviews = "green";
  }
  
  // Apply Sellers filter
  const sellers = parseInt(currentData.totalSellers) || 0;
  if (filters.sellersMin && sellers < parseInt(filters.sellersMin)) {
    document.getElementById("totalSellers").className = "red";
    filterStatus.sellers = "red";
  } else if (filters.sellersMax && sellers > parseInt(filters.sellersMax)) {
    document.getElementById("totalSellers").className = "red";
    filterStatus.sellers = "red";
  } else if (filters.sellersMin || filters.sellersMax) {
    document.getElementById("totalSellers").className = "green";
    filterStatus.sellers = "green";
  }
  
  // Apply Rating filter
  const rating = parseFloat(currentData.rating) || 0;
  if (filters.ratingMin && rating < parseFloat(filters.ratingMin)) {
    document.getElementById("rating").className = "red";
    filterStatus.rating = "red";
  } else if (filters.ratingMax && rating > parseFloat(filters.ratingMax)) {
    document.getElementById("rating").className = "red";
    filterStatus.rating = "red";
  } else if (filters.ratingMin || filters.ratingMax) {
    document.getElementById("rating").className = "green";
    filterStatus.rating = "green";
  }
  
  // Apply Bought filter
  const boughtText = currentData.boughtInPastMonth;
  let bought = 0;
  if (boughtText.includes('K')) {
    bought = parseFloat(boughtText) * 1000;
  } else {
    bought = parseInt(boughtText.replace(/[^0-9]/g, '')) || 0;
  }
  
  if (filters.boughtMin && bought < parseInt(filters.boughtMin)) {
    document.getElementById("boughtInPastMonth").className = "red";
    filterStatus.bought = "red";
  } else if (filters.boughtMax && bought > parseInt(filters.boughtMax)) {
    document.getElementById("boughtInPastMonth").className = "red";
    filterStatus.bought = "red";
  } else if (filters.boughtMin || filters.boughtMax) {
    document.getElementById("boughtInPastMonth").className = "green";
    filterStatus.bought = "green";
  }
  
  // Apply Price filter
  const price = parseFloat(currentData.price.replace(/[^0-9.]/g, '')) || 0;
  if (filters.priceMin && price < parseFloat(filters.priceMin)) {
    document.getElementById("price").className = "red";
    filterStatus.price = "red";
  } else if (filters.priceMax && price > parseFloat(filters.priceMax)) {
    document.getElementById("price").className = "red";
    filterStatus.price = "red";
  } else if (filters.priceMin || filters.priceMax) {
    document.getElementById("price").className = "green";
    filterStatus.price = "green";
  }
  
  // Determine overall status
  const statusElem = document.getElementById("status");
  const allGreen = Object.values(filterStatus).every(status => 
    status === "green" || status === null
  );
  
  if (allGreen) {
    statusElem.textContent = "Status: GREEN";
    statusElem.className = "status-bar status-green";
  } else {
    statusElem.textContent = "Status: RED";
    statusElem.className = "status-bar status-red";
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    getProductData();
});