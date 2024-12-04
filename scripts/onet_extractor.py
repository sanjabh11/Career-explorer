import requests
from bs4 import BeautifulSoup
import json
import logging
from typing import Dict, List, Any
from datetime import datetime
import os
from concurrent.futures import ThreadPoolExecutor
from urllib.parse import urljoin
import re

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('onet_extraction.log'),
        logging.StreamHandler()
    ]
)

class OnetDataExtractor:
    def __init__(self):
        self.base_urls = [
            'https://services.onetcenter.org/reference/',
            'https://services.onetcenter.org/about',
            'https://services.onetcenter.org/reference/online',
            'https://services.onetcenter.org/reference/taxonomy',
            'https://services.onetcenter.org/reference/database'
        ]
        self.repository = {
            'metadata': {
                'last_updated': datetime.now().isoformat(),
                'version': '1.0',
                'source_urls': self.base_urls
            },
            'core_content': {},
            'taxonomy': {},
            'database_structure': {},
            'api_reference': {},
            'statistics': {}
        }
        self.session = requests.Session()

    def extract_page_content(self, url: str) -> Dict[str, Any]:
        """Extract content from a single page with error handling"""
        try:
            response = self.session.get(url)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Extract main content
            main_content = soup.find('main') or soup.find('div', class_='content')
            if not main_content:
                logging.warning(f"No main content found for {url}")
                return {}

            # Extract critical information based on Pareto principle
            critical_data = {
                'title': soup.title.string if soup.title else '',
                'headers': [h.text.strip() for h in main_content.find_all(['h1', 'h2', 'h3'])],
                'key_points': self._extract_key_points(main_content),
                'tables': self._extract_tables(main_content),
                'links': self._extract_important_links(main_content),
                'metadata': {
                    'url': url,
                    'last_extracted': datetime.now().isoformat()
                }
            }

            return critical_data

        except Exception as e:
            logging.error(f"Error extracting content from {url}: {str(e)}")
            return {}

    def _extract_key_points(self, content) -> List[str]:
        """Extract key points from content focusing on critical information"""
        key_points = []
        
        # Extract from paragraphs that contain important keywords
        important_keywords = ['important', 'key', 'critical', 'essential', 'primary', 'core']
        paragraphs = content.find_all('p')
        
        for p in paragraphs:
            text = p.text.strip()
            if any(keyword in text.lower() for keyword in important_keywords):
                key_points.append(text)
        
        # Limit to top 20% most relevant points
        return key_points[:max(1, len(key_points) // 5)]

    def _extract_tables(self, content) -> List[Dict[str, Any]]:
        """Extract and structure table data"""
        tables = []
        for table in content.find_all('table'):
            headers = []
            rows = []
            
            # Extract headers
            for th in table.find_all('th'):
                headers.append(th.text.strip())
            
            # Extract rows
            for tr in table.find_all('tr'):
                row = [td.text.strip() for td in tr.find_all('td')]
                if row:
                    rows.append(row)
            
            if headers or rows:
                tables.append({
                    'headers': headers,
                    'rows': rows
                })
        
        return tables

    def _extract_important_links(self, content) -> List[Dict[str, str]]:
        """Extract important links based on context"""
        important_links = []
        for link in content.find_all('a'):
            href = link.get('href')
            text = link.text.strip()
            
            if href and text and not href.startswith('#'):
                # Prioritize links containing key terms
                if any(term in text.lower() for term in ['api', 'database', 'reference', 'guide', 'documentation']):
                    important_links.append({
                        'text': text,
                        'url': urljoin(self.base_urls[0], href)
                    })
        
        return important_links

    def build_repository(self):
        """Build the complete repository with parallel processing"""
        logging.info("Starting repository build...")
        
        with ThreadPoolExecutor(max_workers=5) as executor:
            # Map URLs to their respective content sections
            future_to_url = {
                executor.submit(self.extract_page_content, url): url 
                for url in self.base_urls
            }
            
            for future in future_to_url:
                url = future_to_url[future]
                try:
                    data = future.result()
                    if data:
                        # Categorize content based on URL path
                        if 'taxonomy' in url:
                            self.repository['taxonomy'][url] = data
                        elif 'database' in url:
                            self.repository['database_structure'][url] = data
                        elif 'reference' in url:
                            self.repository['api_reference'][url] = data
                        else:
                            self.repository['core_content'][url] = data
                except Exception as e:
                    logging.error(f"Error processing {url}: {str(e)}")

        # Generate statistics
        self._generate_statistics()
        self._save_repository()
        
        logging.info("Repository build completed")

    def _generate_statistics(self):
        """Generate repository statistics for monitoring"""
        self.repository['statistics'] = {
            'total_pages': len(self.base_urls),
            'content_distribution': {
                'taxonomy': len(self.repository['taxonomy']),
                'database': len(self.repository['database_structure']),
                'api': len(self.repository['api_reference']),
                'core': len(self.repository['core_content'])
            },
            'extraction_timestamp': datetime.now().isoformat()
        }

    def _save_repository(self):
        """Save the repository to a JSON file with error handling"""
        try:
            output_dir = 'onet_repository'
            os.makedirs(output_dir, exist_ok=True)
            
            output_file = os.path.join(output_dir, 'onet_reference.json')
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(self.repository, f, indent=2, ensure_ascii=False)
            
            logging.info(f"Repository saved to {output_file}")
        except Exception as e:
            logging.error(f"Error saving repository: {str(e)}")

    def search_repository(self, query: str) -> Dict[str, Any]:
        """Search through the repository content"""
        results = {
            'query': query,
            'matches': []
        }
        
        def search_dict(data, path=''):
            if isinstance(data, dict):
                for key, value in data.items():
                    new_path = f"{path}.{key}" if path else key
                    if isinstance(value, (dict, list)):
                        search_dict(value, new_path)
                    elif isinstance(value, str) and query.lower() in value.lower():
                        results['matches'].append({
                            'path': new_path,
                            'content': value
                        })
            elif isinstance(data, list):
                for i, item in enumerate(data):
                    search_dict(item, f"{path}[{i}]")

        search_dict(self.repository)
        return results

def main():
    """Main execution function"""
    try:
        extractor = OnetDataExtractor()
        extractor.build_repository()
        
        # Example search functionality
        sample_search = extractor.search_repository("API")
        logging.info(f"Sample search results: {len(sample_search['matches'])} matches found")
        
    except Exception as e:
        logging.error(f"Error in main execution: {str(e)}")

if __name__ == "__main__":
    main()