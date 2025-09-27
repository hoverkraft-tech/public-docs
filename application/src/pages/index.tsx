import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';

import styles from './index.module.css';

function HeroSection() {
  return (
    <section className={styles.hero}>
      <div className={styles.heroContainer}>
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <h1 className={styles.heroTitle}>
              Welcome to <span className={styles.brandHighlight}>Hoverkraft</span>
            </h1>
            <p className={styles.heroSubtitle}>
              Your gateway to open-source innovation. Discover, contribute, and build amazing things with our developer-first ecosystem.
            </p>
            <div className={styles.heroActions}>
              <Link
                className={styles.ctaPrimary}
                to="/docs/intro">
                Explore Projects
              </Link>
              <Link
                className={styles.ctaSecondary}
                to="https://github.com/hoverkraft-tech">
                View on GitHub
              </Link>
            </div>
          </div>
          <div className={styles.heroVisual}>
            <div className={styles.floatingCard}>
              <div className={styles.cardHeader}>
                <div className={styles.cardDots}>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
              <div className={styles.cardContent}>
                <img 
                  src="/img/home.png" 
                  alt="Hoverkraft Platform" 
                  className={styles.heroImage}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ValuePropsSection() {
  const values = [
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
    <section className={styles.valueProps}>
      <div className={styles.container}>
        <h2 className={styles.sectionTitle}>Why Choose Hoverkraft?</h2>
        <div className={styles.valuesGrid}>
          {values.map((value, idx) => (
            <div key={idx} className={styles.valueCard}>
              <div className={styles.valueIcon}>{value.icon}</div>
              <h3 className={styles.valueTitle}>{value.title}</h3>
              <p className={styles.valueDescription}>{value.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectsSection() {
  return (
    <section className={styles.projects}>
      <div className={styles.container}>
        <div className={styles.projectsHeader}>
          <h2 className={styles.sectionTitle}>Explore Our Ecosystem</h2>
          <p className={styles.sectionDescription}>
            Discover a curated collection of tools, libraries, and frameworks designed to accelerate your development workflow.
          </p>
        </div>
        
        <div className={styles.projectsGrid}>
          <div className={styles.projectCard}>
            <div className={styles.projectHeader}>
              <div className={styles.projectIcon}>⚡</div>
              <div>
                <h3 className={styles.projectTitle}>compose-action</h3>
                <p className={styles.projectMeta}>⭐ 190 • TypeScript</p>
              </div>
            </div>
            <p className={styles.projectDescription}>
              This action runs your docker-compose file and clean up before action finished. Available on GitHub Marketplace.
            </p>
            <div className={styles.projectFooter}>
              <span className={styles.projectTag}>github-actions</span>
              <span className={styles.projectTag}>docker-compose</span>
              <span className={styles.projectTag}>ci</span>
            </div>
          </div>

          <div className={styles.projectCard}>
            <div className={styles.projectHeader}>
              <div className={styles.projectIcon}>🔧</div>
              <div>
                <h3 className={styles.projectTitle}>bitnami-depreciation</h3>
                <p className={styles.projectMeta}>⭐ 6 • Shell</p>
              </div>
            </div>
            <p className={styles.projectDescription}>
              Help you to survive the Bitnami deprecation on 2025-08-28. Migration tools and guides for affected charts.
            </p>
            <div className={styles.projectFooter}>
              <span className={styles.projectTag}>bitnami</span>
              <span className={styles.projectTag}>helm</span>
              <span className={styles.projectTag}>kubernetes</span>
            </div>
          </div>

          <div className={styles.projectCard}>
            <div className={styles.projectHeader}>
              <div className={styles.projectIcon}>⚡</div>
              <div>
                <h3 className={styles.projectTitle}>ci-github-container</h3>
                <p className={styles.projectMeta}>⭐ 4 • Smarty</p>
              </div>
            </div>
            <p className={styles.projectDescription}>
              Opinionated GitHub Actions and workflows for continuous integration in container (OCI) context.
            </p>
            <div className={styles.projectFooter}>
              <span className={styles.projectTag}>containers</span>
              <span className={styles.projectTag}>github-actions</span>
              <span className={styles.projectTag}>ci</span>
            </div>
          </div>
        </div>

        <div className={styles.projectsCTA}>
          <Link
            className={styles.ctaPrimary}
            to="/docs/projects">
            Browse All Projects
          </Link>
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
