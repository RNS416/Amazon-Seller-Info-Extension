Amazon Seller Info Extension - User Guide
Overview
The Amazon Seller Info Extension is a powerful tool for Amazon sellers, buyers, and product researchers. It extracts key product information from Amazon product pages and allows you to filter products based on custom criteria, saving the data to CSV for further analysis.

Features
Data Extraction
Brand Information - Extract product brand details

Seller Information - Identify who sells and ships the product

Pricing Data - Capture current product pricing

Sales Metrics - View sales rank (BSR), units sold, and review data

Product Identifiers - Extract ASIN and category information

Competitive Analysis - See total number of sellers for each product

Filter System
BSR Rank Filter - Set minimum and maximum Best Sellers Rank values

Review Filter - Filter by number of reviews

Seller Count Filter - Filter by number of sellers offering the product

Rating Filter - Filter by product rating (0-5 scale)

Sales Volume Filter - Filter by units sold in past month (supports K notation: 1K = 1000)

Price Filter - Filter by product price range

Brand/Seller Check - Automatic detection of brand-owned vs. third-party sellers

Data Management
CSV Export - Save product data to CSV files for offline analysis

Multi-Product Tracking - Add multiple products to your export list

Persistent Filters - Your filter settings are saved between sessions

Installation
Download all the extension files:

manifest.json

content.js

popup.html

popup.js

background.js

icon.png (any 128x128px image)

Open Chrome and navigate to:

text
chrome://extensions/
Enable "Developer mode" in the top right corner

Click "Load unpacked" and select the folder containing your extension files

The extension icon should now appear in your Chrome toolbar

How to Use
Basic Usage
Navigate to any Amazon product page (Amazon.com, Amazon.co.uk, etc.)

Click the Amazon Seller Info extension icon in your toolbar

The popup will automatically load and display all available product information

Review the extracted data:

Green values indicate favorable conditions

Red values may indicate potential issues (Amazon as seller, brand selling directly, etc.)

Using Filters
Click "Show Filters" to expand the filter panel

Set your desired criteria for each filter:

BSR Min/Max: Set acceptable Best Sellers Rank range

Reviews Min/Max: Set minimum and maximum review counts

Sellers Min/Max: Set desired number of sellers

Rating Min/Max: Set product rating range (0.0-5.0)

Bought Min/Max: Set sales volume thresholds

Price Min/Max: Set price range in USD

Click "Apply Filters" to check the current product against your criteria

The extension will visually indicate which values meet your criteria:

Green: Value meets your filter criteria

Red: Value does not meet your filter criteria

The overall status will show:

GREEN: All values meet your filter criteria

RED: One or more values don't meet your criteria

Saving and Exporting Data
Add Row: Click "Add Row" to save the current product's data to storage

The product will be added to your CSV export list

You'll see a confirmation message

Export CSV: Click "Export CSV" to download all saved products as a CSV file

The file will be named "amazon_products.csv"

Contains all products you've added with the "Add Row" button

Interpretation Guide
Understanding the Data
Brand vs. Sold By:

Green: Different entities (typically favorable for resellers)

Red: Same entity or Amazon (may indicate brand direct sales)

BSR Rank: Lower numbers are better (#1 is best-selling)

Total Sellers: Fewer sellers may indicate less competition

Bought in Past Month: Higher numbers indicate popular products

Rating: Higher ratings (4.0+) generally indicate better products

Filter Strategy Tips
For resellers: Look for products with medium BSR (100-10,000), good ratings (4.0+), and reasonable competition (5-20 sellers)

For private label: Look for products with high ratings but areas for improvement

For wholesale: Look for products with high demand (low BSR, high units sold) but manageable competition

Troubleshooting
Common Issues
"Loading..." doesn't change:

Refresh the Amazon page

Click the extension icon again

Data not extracting properly:

Ensure you're on a valid Amazon product page

Amazon may have changed their page layout

Filters not working:

Click "Apply Filters" after changing values

Check that you've entered valid numbers

CSV export not working:

Ensure you've added products with "Add Row" first

Check browser permissions for downloads

Support
If you encounter issues:

Try refreshing the page and extension

Check that you're using the latest version of the extension

Ensure you're on a supported Amazon domain (.com, .co.uk, .ca, .de, .in, .jp)

Tips for Best Results
Use consistent filtering - Set your criteria before analyzing multiple products

Refresh data - Product information changes frequently on Amazon

Combine with other tools - Use this data alongside other Amazon research tools

Regular exports - Export your CSV regularly to avoid losing data

Privacy
This extension:

Only accesses data from Amazon pages you actively visit

Stores data locally in your browser

Does not send any data to external servers

Respects your privacy and browsing habits