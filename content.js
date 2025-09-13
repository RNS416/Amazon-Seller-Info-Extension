console.log("✅ Content script loaded for Amazon Seller Info");

// Simple function to extract data from Amazon page
function extractAmazonData() {
    console.log("Extracting data from Amazon page...");
    
    // Get ASIN - multiple methods
    let asin = "Not found";
    // Method 1: From meta tag
    const asinMeta = document.querySelector("meta[name='ASIN']");
    if (asinMeta && asinMeta.content) {
        asin = asinMeta.content;
    } 
    // Method 2: From URL
    else {
        const urlMatch = window.location.href.match(/\/dp\/([A-Z0-9]{10})/i);
        if (urlMatch && urlMatch[1]) {
            asin = urlMatch[1];
        }
        // Method 3: From product details
        else {
            const asinTextMatch = document.body.textContent.match(/ASIN[\s:]*([A-Z0-9]{10})/i);
            if (asinTextMatch && asinTextMatch[1]) {
                asin = asinTextMatch[1];
            }
        }
    }
    
    // Get brand
    let brand = "Not found";
    const brandElem = document.querySelector("#bylineInfo") || document.querySelector("a#brand");
    if (brandElem) brand = brandElem.textContent.trim();
    
    // Get price
    let price = "Not found";
    const priceElem = document.querySelector("#priceblock_ourprice, #priceblock_dealprice, .a-price .a-offscreen");
    if (priceElem) price = priceElem.textContent.trim();
    
    // Get rating
    let rating = "Not found";
    const ratingElem = document.querySelector("i.a-icon-star span.a-icon-alt");
    if (ratingElem) {
        const match = ratingElem.textContent.match(/([\d.]+) out of 5/);
        if (match) rating = match[1];
    }
    
    // Get review count
    let reviewCount = "Not found";
    const reviewElem = document.querySelector("#acrCustomerReviewText");
    if (reviewElem) reviewCount = reviewElem.textContent.replace(/\D/g, "").trim();
    
    // Get seller info
    let soldBy = "Not found";
    let shipsFrom = "Not found";
    
    // Try to find seller info in various places
    const sellerElements = document.querySelectorAll('div.a-row, span.a-text-bold, th.a-color-secondary');
    for (const element of sellerElements) {
        const text = element.textContent;
        if (text.includes('Sold by')) {
            const nextElement = element.nextElementSibling;
            if (nextElement) soldBy = nextElement.textContent.trim();
        }
        if (text.includes('Ships from')) {
            const nextElement = element.nextElementSibling;
            if (nextElement) shipsFrom = nextElement.textContent.trim();
        }
    }
    
    // Get total sellers - comprehensive detection
    let totalSellers = "Not found";
    
    // Method 1: Look for "X options from $Y.ZZ" pattern
    const optionsMatch = document.body.textContent.match(/(\d+)\s+options\s+from/i);
    if (optionsMatch && optionsMatch[1]) {
        totalSellers = optionsMatch[1];
    }
    // Method 2: Look for "New (X) from $Y.ZZ" pattern
    else {
        const newMatch = document.body.textContent.match(/New\s+\((\d+)\)\s+from/i);
        if (newMatch && newMatch[1]) {
            totalSellers = newMatch[1];
        }
        // Method 3: Look for "X new from $Y.ZZ" pattern
        else {
            const newFromMatch = document.body.textContent.match(/(\d+)\s+new\s+from/i);
            if (newFromMatch && newFromMatch[1]) {
                totalSellers = newFromMatch[1];
            }
            // Method 4: Look for seller count in offer listing links
            else {
                const sellerLinks = document.querySelectorAll('a');
                for (const link of sellerLinks) {
                    if (link.href && link.href.includes('offer-listing')) {
                        // Look for patterns like "17 new from $19.98" or "41 offers"
                        const match = link.textContent.match(/(\d+)\s+(?:new|used|offers|options)/i);
                        if (match) {
                            totalSellers = match[1];
                            break;
                        }
                    }
                }
                // Method 5: Search the entire page text as last resort
                if (totalSellers === "Not found") {
                    const pageText = document.body.textContent;
                    const patterns = [
                        /(\d+)\s+options\s+from/i,
                        /New\s+\((\d+)\)\s+from/i,
                        /(\d+)\s+new\s+from/i,
                        /(\d+)\s+used\s+from/i,
                        /See all\s+(\d+)\s+offers/i
                    ];
                    
                    for (const pattern of patterns) {
                        const match = pageText.match(pattern);
                        if (match && match[1]) {
                            totalSellers = match[1];
                            break;
                        }
                    }
                }
            }
        }
    }
    
    // Get BSR
    let bsrRank = "Not found";
    let category = "Not found";
    const bsrMatch = document.body.textContent.match(/#([\d,]+)\s+in\s+([^(\n]+)/);
    if (bsrMatch) {
        bsrRank = bsrMatch[1].replace(/,/g, '');
        category = bsrMatch[2].trim();
    }
    
    // Get bought in past month
    let boughtInPastMonth = "Not found";
    const boughtMatch = document.body.textContent.match(/([\d,]+[Kk]?\+?)\s+bought in past month/i);
    if (boughtMatch) boughtInPastMonth = boughtMatch[1];
    
    return {
        brand,
        shipsFrom,
        soldBy,
        totalSellers,
        asin,
        bsrRank,
        category,
        price,
        boughtInPastMonth,
        rating,
        reviewCount
    };
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getSeller") {
        console.log("Received request for seller data");
        const data = extractAmazonData();
        console.log("Sending data:", data);
        sendResponse(data);
        return true; // Keep the message channel open for async response
    }
});