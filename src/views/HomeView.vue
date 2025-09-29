<template>
  <div class="home-container">
    <section class="hero-section">
      <h1 class="hero-title">Welcome to the File Upload System</h1>
      <p class="hero-subtitle">Upload, manage, and share your files securely and effortlessly.</p>
      <RouterLink to="/dashboard" class="cta-button">Get Started</RouterLink>
    </section>

    <section class="features-section">
      <h2 class="section-title">Features</h2>
      <div class="features-grid">
        <div class="feature-card">
          <h3>Secure Uploads</h3>
          <p>All files are encrypted and stored safely in the cloud.</p>
        </div>
        <div class="feature-card">
          <h3>Easy Management</h3>
          <p>Organize your files in folders and access them anytime.</p>
        </div>
        <div class="feature-card">
          <h3>Share Files</h3>
          <p>Generate secure links to share files with others instantly.</p>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px 20px;
}

/* Hero Section */
.hero-section {
  text-align: center;
  padding: 60px 20px;
  background-color: var(--color-background-soft);
  border-radius: 12px;
  margin-bottom: 50px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.hero-title {
  font-size: 2.8rem;
  font-weight: bold;
  margin-bottom: 16px;
}

.hero-subtitle {
  font-size: 1.2rem;
  margin-bottom: 30px;
}

.cta-button {
  padding: 12px 28px;
  font-size: 1rem;
  font-weight: 600;
  background-color: #3a6ea5; /* 主色 */
  color: #fff;
  border-radius: 6px;
  text-decoration: none;
  transition: background-color 0.3s ease;
}

.cta-button:hover {
  background-color: #5a87bf;
}

/* Features Section */
.features-section {
  text-align: center;
}

.section-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 30px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 24px;
}

.feature-card {
  padding: 20px;
  border-radius: 10px;
  background-color: var(--color-background-mute);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.feature-card h3 {
  font-size: 1.2rem;
  margin-bottom: 12px;
}

.feature-card p {
  font-size: 0.95rem;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
}

/* Responsive */
@media (max-width: 600px) {
  .hero-title {
    font-size: 2rem;
  }
  .hero-subtitle {
    font-size: 1rem;
  }
}
</style>
