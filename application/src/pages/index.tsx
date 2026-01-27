import type {ReactNode} from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import { HoverkraftProjectCard, HoverkraftFeatureList, HoverkraftHero, HoverkraftBrandHighlight, HoverkraftButton } from "@hoverkraft/docusaurus-theme/components";

function HeroSection() {
  return (
    <HoverkraftHero
      title={
        <>
          Welcome to <HoverkraftBrandHighlight>Hoverkraft</HoverkraftBrandHighlight>
        </>
      }
      description="Your gateway to open-source innovation. Discover, contribute, and build amazing things with our developer-first ecosystem."
      supportingVisual="/img/home.png"
      actions={[
        {
          label: 'Discover documentation',
          to: '/docs/intro',
          variant: 'primary',
        },
        {
          label: 'Explore Projects',
          to: '/docs/projects',
          variant: 'secondary',
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
        <Heading as="h2" style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '3rem' }}>
          Why Choose Hoverkraft?
        </Heading>
        <HoverkraftFeatureList features={features} align="center" />
      </div>
    </section>
  );
}

function ProjectsSection() {
  const projects = [
    {
      name: 'compose-action',
      icon: '⚡',
      url: 'https://github.com/hoverkraft-tech/compose-action',
      stars: 199,
      language: 'TypeScript',
      description: 'This action runs your docker-compose file and clean up before action finished',
      tags: [
        'continuous-integration',
        'docker-compose',
        'github-actions'
      ],
      accent: 'primary'
    },
    {
      name: 'ci-dokumentor',
      icon: '⚡',
      url: 'https://github.com/hoverkraft-tech/ci-dokumentor',
      stars: 2,
      language: 'TypeScript',
      description: 'Automated documentation generator for CI/CD components',
      tags: [
        'documentation',
        'github-actions',
        'open-source'
      ],
      accent: 'neutral'
    },
    {
      name: 'ci-github-container',
      icon: '⚡',
      url: 'https://github.com/hoverkraft-tech/ci-github-container',
      stars: 4,
      language: 'Go Template',
      description: 'Opinionated GitHub Actions and workflows for continuous integration in container (OCI) context',
      tags: [
        'build',
        'containers',
        'continuous-integration'
      ],
      accent: 'primary'
    }
  ];
  
  return (
    <section style={{ padding: '4rem 0' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <Heading as="h2" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
            Explore Our Ecosystem
          </Heading>
          <p style={{ fontSize: '1.125rem', color: 'var(--ifm-color-emphasis-700)' }}>
            Discover a curated collection of tools, libraries, and frameworks designed to accelerate your development workflow.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
          {
            projects.map((project, index) => (
              <HoverkraftProjectCard
                icon={project.icon}
                title={project.name}
                titleHref={project.url}
                titleTarget="_blank"
                meta={`⭐ ${project.stars} • ${project.language}`}
                description={project.description}
                tags={project.tags}
                accent={index % 2 === 0 ? 'primary' : 'neutral'}
              />
            ))
          }
        </div>

        <div style={{ textAlign: 'center' }}>
          <HoverkraftButton
            href="/docs/projects"
            variant="primary"
            label="Browse All Projects"
          />
        </div>
      </div>
    </section>
  );
}

export { HeroSection, ValuePropsSection, ProjectsSection };

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title="Home"
      description={siteConfig.tagline}>
      <HeroSection />
      <ValuePropsSection />
      <ProjectsSection />
    </Layout>
  );
}
