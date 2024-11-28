import React from 'react';
import Layout from '../components/Layout';
import JobTaxonomySelector from '../components/JobTaxonomySelector';
import SearchBar from '../components/SearchBar';
import FeaturedOccupations from '../components/FeaturedOccupations';
import QuickAPOCalculator from '../components/QuickAPOCalculator';

const Home: React.FC = () => {
  return (
    <Layout>
      <main className="container mx-auto px-4">
        <section className="hero py-12">
          <h1 className="text-4xl font-bold mb-4">GenAI Skill-Set Exposure Tool</h1>
          <p className="text-xl mb-8">Discover how AI is transforming careers and skills across industries</p>
          <SearchBar />
        </section>

        <section className="my-12">
          <FeaturedOccupations />
        </section>

        <section className="my-12">
          <QuickAPOCalculator />
        </section>

        <section className="my-12">
          <JobTaxonomySelector />
        </section>
      </main>
    </Layout>
  );
};

export default Home;
