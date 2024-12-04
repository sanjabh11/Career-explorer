import requests
from bs4 import BeautifulSoup
import json
import logging
from typing import Dict, List, Optional
import os
from datetime import datetime
import time

class OnetReferenceHelper:
    def __init__(self, cache_dir: str = "onet_cache"):
        self.base_urls = {
            "main": "https://services.onetcenter.org/reference/",
            "about": "https://services.onetcenter.org/about",
            "online": "https://services.onetcenter.org/reference/online",
            "taxonomy": "https://services.onetcenter.org/reference/taxonomy",
            "database": "https://services.onetcenter.org/reference/database"
        }
        self.session = requests.Session()
        self.cache_dir = cache_dir
        self.knowledge_base = {}
        self.setup_logging()
        self.setup_cache()

    def setup_cache(self):
        """Setup cache directory for storing parsed documentation."""
        if not os.path.exists(self.cache_dir):
            os.makedirs(self.cache_dir)

    def setup_logging(self):
        """Configure logging with detailed formatting."""
        log_file = f"onet_helper_{datetime.now().strftime('%Y%m%d')}.log"
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - [%(filename)s:%(lineno)d] - %(message)s',
            handlers=[
                logging.FileHandler(log_file),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)

    def get_cache_path(self, url_key: str) -> str:
        """Generate cache file path for a given URL key."""
        return os.path.join(self.cache_dir, f"{url_key}_cache.json")

    def load_from_cache(self, url_key: str) -> Optional[dict]:
        """Load cached documentation if available and not expired."""
        cache_file = self.get_cache_path(url_key)
        if os.path.exists(cache_file):
            with open(cache_file, 'r', encoding='utf-8') as f:
                cached_data = json.load(f)
                # Check if cache is less than 24 hours old
                if time.time() - cached_data.get('timestamp', 0) < 86400:
                    return cached_data.get('data')
        return None

    def save_to_cache(self, url_key: str, data: dict):
        """Save parsed documentation to cache."""
        cache_file = self.get_cache_path(url_key)
        cache_data = {
            'timestamp': time.time(),
            'data': data
        }
        with open(cache_file, 'w', encoding='utf-8') as f:
            json.dump(cache_data, f, indent=2)

    def fetch_page(self, url: str) -> Optional[str]:
        """Fetch content from a given URL with retry mechanism."""
        max_retries = 3
        for attempt in range(max_retries):
            try:
                response = self.session.get(url)
                response.raise_for_status()
                return response.text
            except requests.RequestException as e:
                self.logger.warning(f"Attempt {attempt + 1}/{max_retries} failed for {url}: {str(e)}")
                if attempt == max_retries - 1:
                    self.logger.error(f"Failed to fetch {url} after {max_retries} attempts")
                    return None
                time.sleep(1)  # Wait before retry

    def parse_documentation(self, url_key: str) -> Optional[dict]:
        """Parse O*NET documentation page with caching."""
        # Try to load from cache first
        cached_data = self.load_from_cache(url_key)
        if cached_data:
            self.logger.info(f"Loading {url_key} documentation from cache")
            return cached_data

        url = self.base_urls.get(url_key)
        if not url:
            self.logger.error(f"Unknown URL key: {url_key}")
            return None

        content = self.fetch_page(url)
        if not content:
            return None

        soup = BeautifulSoup(content, 'html.parser')
        parsed_data = {
            'title': soup.title.string if soup.title else None,
            'url': url,
            'sections': self._extract_sections(soup),
            'metadata': self._extract_metadata(soup),
            'links': self._extract_links(soup),
            'tables': self._extract_tables(soup)
        }

        # Save to cache
        self.save_to_cache(url_key, parsed_data)
        return parsed_data

    def _extract_metadata(self, soup: BeautifulSoup) -> dict:
        """Extract metadata from the page."""
        metadata = {}
        meta_tags = soup.find_all('meta')
        for tag in meta_tags:
            if tag.get('name'):
                metadata[tag['name']] = tag.get('content', '')
        return metadata

    def _extract_links(self, soup: BeautifulSoup) -> List[dict]:
        """Extract relevant links from the page."""
        links = []
        for link in soup.find_all('a', href=True):
            if any(base_url in link['href'] for base_url in self.base_urls.values()):
                links.append({
                    'text': link.get_text(strip=True),
                    'href': link['href']
                })
        return links

    def _extract_tables(self, soup: BeautifulSoup) -> List[dict]:
        """Extract tables from the documentation."""
        tables = []
        for table in soup.find_all('table'):
            headers = []
            rows = []
            
            # Extract headers
            for th in table.find_all('th'):
                headers.append(th.get_text(strip=True))
            
            # Extract rows
            for tr in table.find_all('tr'):
                row = []
                for td in tr.find_all('td'):
                    row.append(td.get_text(strip=True))
                if row:  # Only add non-empty rows
                    rows.append(row)
            
            tables.append({
                'headers': headers,
                'rows': rows
            })
        return tables

    def _extract_sections(self, soup: BeautifulSoup) -> Dict[str, str]:
        """Extract main sections from the documentation."""
        sections = {}
        main_content = soup.find('div', {'id': 'content'})
        if main_content:
            current_section = None
            current_content = []
            
            for element in main_content.children:
                if element.name in ['h1', 'h2', 'h3']:
                    if current_section:
                        sections[current_section] = '\n'.join(current_content)
                    current_section = element.get_text(strip=True)
                    current_content = []
                elif current_section and str(element).strip():
                    current_content.append(str(element))
            
            # Add the last section
            if current_section:
                sections[current_section] = '\n'.join(current_content)
                
        return sections

    def build_knowledge_base(self):
        """Build comprehensive knowledge base from all O*NET sources."""
        self.logger.info("Building comprehensive O*NET knowledge base...")
        for url_key in self.base_urls.keys():
            self.logger.info(f"Processing {url_key} documentation...")
            doc_data = self.parse_documentation(url_key)
            if doc_data:
                self.knowledge_base[url_key] = doc_data
        self.logger.info("Knowledge base building completed")

    def search_knowledge_base(self, query: str) -> List[dict]:
        """Search through the entire knowledge base for specific terms."""
        results = []
        query = query.lower()
        
        for source, data in self.knowledge_base.items():
            # Search in sections
            for section_title, content in data['sections'].items():
                if query in content.lower() or query in section_title.lower():
                    results.append({
                        'source': source,
                        'section': section_title,
                        'content': content,
                        'relevance': 'high' if query in section_title.lower() else 'medium'
                    })
            
            # Search in tables
            for table in data.get('tables', []):
                for row in table['rows']:
                    if any(query in cell.lower() for cell in row):
                        results.append({
                            'source': source,
                            'type': 'table',
                            'content': row,
                            'headers': table['headers'],
                            'relevance': 'medium'
                        })

        return sorted(results, key=lambda x: x['relevance'] == 'high', reverse=True)

    def analyze_error(self, error_message: str) -> List[dict]:
        """Analyze an error message and find relevant documentation."""
        self.logger.info(f"Analyzing error: {error_message}")
        
        # Extract key terms from error message
        keywords = error_message.lower().split()
        keywords = [k for k in keywords if len(k) > 3]  # Filter out short words
        
        all_results = []
        for keyword in keywords:
            results = self.search_knowledge_base(keyword)
            all_results.extend(results)
        
        # Remove duplicates and sort by relevance
        unique_results = {f"{r['source']}:{r['section']}": r for r in all_results 
                         if 'section' in r}.values()
        return list(unique_results)

def main():
    helper = OnetReferenceHelper()
    helper.build_knowledge_base()
    print("O*NET Reference Helper initialized and knowledge base built!")
    return helper

if __name__ == "__main__":
    helper = main()
