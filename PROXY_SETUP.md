# API Proxy Setup for Career Explorer

This document explains how to set up and use the API proxy functions for the Career Explorer application.

## Overview

The Career Explorer application uses several external APIs to fetch data:

1. **SERP API**: For searching the web for automation trends
2. **JINA API**: For embedding and analyzing text data
3. **FireCrawl API**: For crawling websites for research data
4. **O*NET API**: For occupation data and job outlook information

To avoid CORS issues and protect API keys, we use Netlify Functions as proxies for these APIs.

## Setup Instructions

### 1. Environment Variables

Copy the `.env.sample` file to `.env` and fill in your API keys:

```bash
cp .env.sample .env
```

Edit the `.env` file and add your API keys:

```
NEXT_PUBLIC_SERP_API_KEY=your_serp_api_key
NEXT_PUBLIC_JINA_API_KEY=your_jina_api_key
NEXT_PUBLIC_FIRECRAWL_API_KEY=your_firecrawl_api_key
ONET_USERNAME=your_onet_username
ONET_PASSWORD=your_onet_password
```

### 2. Install Dependencies

Make sure you have all the required dependencies:

```bash
npm install
```

### 3. Run the Development Server

Start the development server:

```bash
npm run dev
```

### 4. Run the Netlify Functions Locally

In a separate terminal, run the Netlify Functions:

```bash
netlify dev
```

This will start the Netlify Functions server on port 8888.

## Using the Proxy Functions

The application is configured to use the proxy functions automatically. The proxy functions will:

1. Forward requests to the external APIs
2. Handle CORS issues
3. Provide mock data if API keys are missing or API calls fail

## Mock Data

If API keys are not provided or API calls fail, the proxy functions will return mock data. This is useful for development and testing.

To use mock data intentionally, you can:

1. Leave the API keys empty in the `.env` file
2. Set the feature flags to `false` in the `.env` file:

```
NEXT_PUBLIC_USE_DYNAMIC_APO=false
NEXT_PUBLIC_USE_SERP=false
NEXT_PUBLIC_USE_JINA=false
NEXT_PUBLIC_USE_FIRECRAWL=false
```

## Troubleshooting

If you encounter issues with the proxy functions:

1. Check the browser console for error messages
2. Check the Netlify Functions logs in the terminal
3. Verify that your API keys are correct
4. Make sure the Netlify Functions server is running

## Deployment

When deploying to Netlify, make sure to:

1. Add your API keys as environment variables in the Netlify dashboard
2. Enable the Netlify Functions feature
3. Set the build command to `npm run build`
4. Set the publish directory to `out`
