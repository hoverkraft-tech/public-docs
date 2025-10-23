import type {ReactNode} from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import { HoverkraftHero, HoverkraftBrandHighlight } from '@theme/hoverscape/HoverkraftHero';
import { HoverkraftFeatureList } from '@theme/hoverscape/HoverkraftFeatureList';
import { HoverkraftProjectCard } from '@theme/hoverscape/HoverkraftProjectCard';

function HeroSection() {
  return (
    <HoverkraftHero
      title={
        <>
          Welcome to <HoverkraftBrandHighlight>Hoverkraft</HoverkraftBrandHighlight>
        </>
      }
      description="Your gateway to open-source innovation. Discover, contribute, and build amazing things with our developer-first ecosystem."
      supportingVisual={
        <img 
          src="/img/home.png" 
          alt="Hoverkraft Platform" 
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      }
      actions={[
        {
          label: 'Explore Projects',
          to: '/docs/intro',
          variant: 'primary',
        },
        {
          label: 'View on GitHub',
          href: 'https://github.com/hoverkraft-tech',
          variant: 'secondary',
          target: '_blank',
        },
      ]}
      align="left"
      tone="midnight"
    />
  );
}

function ValuePropsSection() {
  const features = [
    {
      icon: '🔓',
      title: 'Open Source',
      description: 'Every project is open source and community-driven. Transparency and collaboration at the core.'
    },
    {
      icon: '⚡',
      title: 'Developer First',
      description: 'Built by developers, for developers. Clean APIs, comprehensive docs, and great DX.'
    },
    {
      icon: '🤝',
      title: 'Community',
      description: 'Join our growing community of contributors building the future of open-source.'
    },
    {
      icon: '🚀',
      title: 'Innovation',
      description: 'Pushing the boundaries with cutting-edge technologies and forward-thinking solutions.'
    }
  ];

  return (
    <section style={{ padding: '4rem 0', backgroundColor: 'var(--ifm-background-surface-color)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '3rem' }}>Why Choose Hoverkraft?</h2>
        <HoverkraftFeatureList features={features} align="center" />
      </div>
    </section>
  );
}

function ProjectsSection() {
  return (
    <section style={{ padding: '4rem 0' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Explore Our Ecosystem</h2>
          <p style={{ fontSize: '1.125rem', color: 'var(--ifm-color-emphasis-700)' }}>
            Discover a curated collection of tools, libraries, and frameworks designed to accelerate your development workflow.
          </p>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
          <HoverkraftProjectCard
            icon="⚡"
            title="compose-action"
            titleHref="https://github.com/hoverkraft-tech/compose-action"
            titleTarget="_blank"
            meta="⭐ 190 • TypeScript"
            description="This action runs your docker-compose file and clean up before action finished. Available on GitHub Marketplace."
            tags={['github-actions', 'docker-compose', 'ci']}
            accent="primary"
          />

          <HoverkraftProjectCard
            icon="🔧"
            title="bitnami-depreciation"
            titleHref="https://github.com/hoverkraft-tech/bitnami-depreciation"
            titleTarget="_blank"
            meta="⭐ 6 • Shell"
            description="Help you to survive the Bitnami deprecation on 2025-08-28. Migration tools and guides for affected charts."
            tags={['bitnami', 'helm', 'kubernetes']}
            accent="neutral"
          />

          <HoverkraftProjectCard
            icon="⚡"
            title="ci-github-container"
            titleHref="https://github.com/hoverkraft-tech/ci-github-container"
            titleTarget="_blank"
            meta="⭐ 4 • Smarty"
            description="Opinionated GitHub Actions and workflows for continuous integration in container (OCI) context."
            tags={['containers', 'github-actions', 'ci']}
            accent="primary"
          />
        </div>

        <div style={{ textAlign: 'center' }}>
          <a
            href="/docs/projects"
            style={{
              display: 'inline-block',
              padding: '0.75rem 2rem',
              backgroundColor: 'var(--ifm-color-primary)',
              color: 'white',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 600,
            }}>
            Browse All Projects
          </a>
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title="Home"
      description="Hoverkraft - Open-source innovation for developers. Discover, contribute, and build amazing things with our developer-first ecosystem.">
      <HeroSection />
      <ValuePropsSection />
      <ProjectsSection />
    </Layout>
  );
}
