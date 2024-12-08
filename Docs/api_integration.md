# API Integration Guide

## O*NET API Integration
- Base URL: /.netlify/functions/onet-proxy
- Endpoints:
  - /search: Search occupations
  - /details: Get occupation details
  - /skills: Get skill details
  - /tasks: Get task details

## Authentication
- Using environment variables for API keys
- Implementing rate limiting
- Error handling for API failures

## Data Models
- Occupation
- Skills
- Tasks
- Knowledge Areas
- Abilities
- Technologies

## Error Handling
- Implementing retry logic
- Proper error messages
- Fallback options
- Loading states

## Performance Considerations
- Caching responses
- Debouncing requests
- Batch requests where possible
- Progressive loading of data
