// MetaGenerator.jsx
import { Helmet } from "react-helmet-async";

const MetaGenerator = (props) => {
  if (!props || !props.job) {
    return null; // If no job data is available, do not render any meta tags
  }

  const { job } = props;
  const cleanDescription = job.jobDesc ? 
    job.jobDesc.replace(/<[^>]*>?/gm, '').substring(0, 200) + '...' : 
    'Job description';
  
  // Current timestamp for recency (when posting to LinkedIn)
  const currentTime = new Date().toISOString();
  
  return (
    <Helmet>
      {/* Basic Meta Tags - These are critical */}
      <title>{`${job.jobTitle} | ${job.customerName || 'Company'}`}</title>
      <meta name="description" content={cleanDescription} />
      
      {/* LinkedIn prioritizes these specific Open Graph tags */}
      <meta property="og:title" content={job.jobTitle} />
      <meta property="og:description" content={cleanDescription} />
      <meta property="og:type" content="article" /> {/* "article" works better for LinkedIn job posts */}
      <meta property="og:url" content={props.url} />
      <meta property="og:image" content={job.logoUrl || 'https://yourdomain.com/default-company-logo.png'} />
      <meta property="og:site_name" content={job.customerName || 'Company'} />
      <meta property="og:published_time" content={currentTime} />
      <meta property="og:modified_time" content={currentTime} />
      
      {/* Add article:publisher property for LinkedIn */}
      <meta property="article:publisher" content={job.customerName || 'Company'} />
      <meta property="article:section" content="Jobs" />
      <meta property="article:tag" content={job.jobType || 'Job'} />
      
      {/* These LinkedIn-specific properties help with formatting */}
      <meta name="linkedin:owner" content={job.customerName || 'Company'} />
      <meta name="linkedin:location" content={job.location || 'Location'} />
      <meta name="author" content={job.customerName || 'Company'} />
      
      {/* Structured Data - This significantly helps search engines and LinkedIn */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org/",
          "@type": "JobPosting",
          "title": job.jobTitle,
          "description": cleanDescription,
          "datePosted": job.createdAt || currentTime,
          "employmentType": job.jobType || "FULL_TIME",
          "hiringOrganization": {
            "@type": "Organization",
            "name": job.customerName || "Company",
            "logo": job.logoUrl || "https://yourdomain.com/default-company-logo.png",
            "sameAs": props.url
          },
          "jobLocation": {
            "@type": "Place",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": job.location || ""
            }
          },
          "baseSalary": job.payBillRate ? {
            "@type": "MonetaryAmount",
            "currency": "USD",
            "value": {
              "@type": "QuantitativeValue",
              "value": job.payBillRate.replace(/[^0-9.]/g, '') || "0",
              "unitText": "HOUR"
            }
          } : undefined,
          "datePublished": job.createdAt || currentTime,
          "validThrough": "", // Optional: Add an expiration date if available
          "applicantLocationRequirements": {
            "@type": "Country",
            "name": "US" // Update this based on your job location
          }
        })}
      </script>
    </Helmet>
  );
};

export default MetaGenerator;