/**
 * API Connection Test Script
 * Version 1.1
 * 
 * Tests connections to external APIs used in the Career Explorer application
 * Enhanced with detailed diagnostics and curl command tests
 */

import { testAllApiConnections } from '../utils/tests/apiConnectionTest';
import * as dotenv from 'dotenv';
import { exec } from 'child_process';
import { promisify } from 'util';

// Load environment variables
dotenv.config();

const execPromise = promisify(exec);

/**
 * Test API key with curl command
 * @param apiName Name of the API
 * @param url URL to test
 * @param headers Headers to include
 * @returns Test result
 */
async function testWithCurl(
  apiName: string, 
  url: string, 
  headers: Record<string, string>
): Promise<{success: boolean; message: string; data?: any}> {
  try {
    console.log(`\n🔄 Testing ${apiName} with curl command...`);
    
    // Build curl command
    let curlCommand = `curl -s -X GET "${url}"`;
    
    // Add headers
    Object.entries(headers).forEach(([key, value]) => {
      curlCommand += ` -H "${key}: ${value}"`;
    });
    
    // Execute curl command
    const { stdout, stderr } = await execPromise(curlCommand);
    
    if (stderr) {
      return {
        success: false,
        message: `Curl command failed: ${stderr}`
      };
    }
    
    try {
      const response = JSON.parse(stdout);
      return {
        success: true,
        message: 'Curl command succeeded',
        data: response
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to parse API response',
        data: stdout
      };
    }
  } catch (error) {
    return {
      success: false,
      message: `Curl command error: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Main function to run API connection tests
 */
async function main() {
  console.log('🔄 Testing API connections...');
  
  // Check if environment variables are set
  const jinaApiKey = process.env.REACT_APP_JINA_API_KEY;
  const serpApiKey = process.env.REACT_APP_SERP_API_KEY;
  
  if (!jinaApiKey) {
    console.error('❌ REACT_APP_JINA_API_KEY is not set in .env file');
  }
  
  if (!serpApiKey) {
    console.error('❌ REACT_APP_SERP_API_KEY is not set in .env file');
  }
  
  try {
    // Test with our utility
    console.log('\n📊 Testing with API utility:');
    console.log('===========================');
    
    const results = await testAllApiConnections();
    
    // Jina API results
    console.log('\n🔹 Jina API:');
    console.log(`Status: ${results.jinaApi.success ? '✅ Success' : '❌ Failed'}`);
    console.log(`Message: ${results.jinaApi.message}`);
    
    if (results.jinaApi.data) {
      console.log('Data:');
      console.log(JSON.stringify(results.jinaApi.data, null, 2));
    }
    
    if (results.jinaApi.error) {
      console.log('Error:');
      console.error(results.jinaApi.error);
    }
    
    // SERP API results
    console.log('\n🔹 SERP API:');
    console.log(`Status: ${results.serpApi.success ? '✅ Success' : '❌ Failed'}`);
    console.log(`Message: ${results.serpApi.message}`);
    
    if (results.serpApi.data) {
      console.log('Data:');
      console.log(JSON.stringify(results.serpApi.data, null, 2));
    }
    
    if (results.serpApi.error) {
      console.log('Error:');
      console.error(results.serpApi.error);
    }
    
    // Test with curl commands
    console.log('\n📊 Testing with curl commands:');
    console.log('============================');
    
    // Test Jina API with curl
    if (jinaApiKey) {
      const jinaResult = await testWithCurl(
        'Jina API',
        'https://api.jina.ai/v1/embeddings',
        {
          'Authorization': `Bearer ${jinaApiKey}`,
          'Content-Type': 'application/json'
        }
      );
      
      console.log(`\nJina API Curl Test: ${jinaResult.success ? '✅ Success' : '❌ Failed'}`);
      console.log(`Message: ${jinaResult.message}`);
      
      if (jinaResult.data) {
        console.log('Response:');
        console.log(typeof jinaResult.data === 'string' 
          ? jinaResult.data.substring(0, 200) + '...' 
          : JSON.stringify(jinaResult.data, null, 2).substring(0, 200) + '...');
      }
    }
    
    // Test SERP API with curl
    if (serpApiKey) {
      const serpResult = await testWithCurl(
        'SERP API',
        `https://serpapi.com/search?api_key=${serpApiKey}&q=automation+research&engine=google`,
        {
          'Content-Type': 'application/json'
        }
      );
      
      console.log(`\nSERP API Curl Test: ${serpResult.success ? '✅ Success' : '❌ Failed'}`);
      console.log(`Message: ${serpResult.message}`);
      
      if (serpResult.data) {
        console.log('Response:');
        console.log(typeof serpResult.data === 'string' 
          ? serpResult.data.substring(0, 200) + '...' 
          : JSON.stringify(serpResult.data, null, 2).substring(0, 200) + '...');
      }
    }
    
    // Summary
    console.log('\n📋 Summary:');
    console.log('===========');
    console.log(`Jina API: ${results.jinaApi.success ? '✅ Success' : '❌ Failed'}`);
    console.log(`SERP API: ${results.serpApi.success ? '✅ Success' : '❌ Failed'}`);
    
    const allSuccess = results.jinaApi.success && results.serpApi.success;
    console.log(`\nOverall Status: ${allSuccess ? '✅ All APIs working correctly' : '❌ Some APIs failed'}`);
    
    if (!allSuccess) {
      console.log('\n🔧 Troubleshooting Tips:');
      console.log('1. Check that your API keys are correct in the .env file');
      console.log('2. Verify that you have an active subscription for the APIs');
      console.log('3. Check if there are any network issues or firewalls blocking the requests');
      console.log('4. Try the requests directly in Postman or with curl to verify');
    }
    
    process.exit(allSuccess ? 0 : 1);
  } catch (error) {
    console.error('❌ Error running tests:', error);
    process.exit(1);
  }
}

// Run the main function
main();
