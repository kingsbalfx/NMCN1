import Layout from "../components/Layout";

export default function Privacy() {
  return (
    <Layout>
      <div className="container" style={{ maxWidth: '900px', margin: '40px auto', paddingBottom: '60px' }}>
        <h1 style={{ marginBottom: '30px', color: '#0066ff' }}>Privacy Policy</h1>
        
        <p style={{ color: '#64748b', marginBottom: '20px', fontStyle: 'italic' }}>
          Last updated: February 2026
        </p>

        <section style={{ marginBottom: '40px' }}>
          <h3>1. Introduction</h3>
          <p>Kingsbal Digital Healthcare Bridge ("we" or "us" or "our") operates the website. This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.</p>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h3>2. Information Collection and Use</h3>
          <p>We collect several different types of information for various purposes to provide and improve our Service to you:</p>
          <ul style={{ marginLeft: '20px', marginBottom: '20px' }}>
            <li><strong>Personal Data:</strong> While using our Service, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you ("Personal Data"). This may include, but is not limited to:
              <ul style={{ marginTop: '10px', marginLeft: '20px' }}>
                <li>Email address</li>
                <li>First name and last name</li>
                <li>Phone number</li>
                <li>Address, State, Province, ZIP/Postal code, City</li>
                <li>Cookies and Usage Data</li>
              </ul>
            </li>
            <li><strong>Usage Data:</strong> We may also collect information on how the Service is accessed and used ("Usage Data"). This may include information such as your computer's Internet Protocol address (e.g. IP address), browser type, browser version, the pages you visit, the time and date of your visit, and other diagnostic data.</li>
          </ul>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h3>3. Use of Data</h3>
          <p>Kingsbal uses the collected data for various purposes:</p>
          <ul style={{ marginLeft: '20px', marginBottom: '20px' }}>
            <li>To provide and maintain the Service</li>
            <li>To notify you about changes to our Service</li>
            <li>To allow you to participate in interactive features of our Service when you choose to do so</li>
            <li>To provide customer care and support</li>
            <li>To gather analysis or valuable information so that we can improve the Service</li>
            <li>To monitor the usage of the Service</li>
            <li>To detect, prevent and address technical issues</li>
          </ul>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h3>4. Security of Data</h3>
          <p>The security of your data is important to us, but remember that no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.</p>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h3>5. Changes to This Privacy Policy</h3>
          <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date at the top of this Privacy Policy.</p>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h3>6. Contact Us</h3>
          <p>If you have any questions about this Privacy Policy, please contact us:</p>
          <p>
            <strong>WhatsApp:</strong> <a href={process.env.NEXT_PUBLIC_WHATSAPP_URL || 'https://wa.me/2347000000000'}>Message us</a><br />
            <strong>Email:</strong> privacy@kingsbal.com<br />
            <strong>Website:</strong> www.kingsbal.com
          </p>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h3>7. CCPA Privacy Rights (Do Not Sell My Personal Information)</h3>
          <p>Under the CCPA, California residents have the right to:</p>
          <ul style={{ marginLeft: '20px', marginBottom: '20px' }}>
            <li>Know what personal information is collected about them</li>
            <li>Know whether their personal information is sold or disclosed and to whom</li>
            <li>Say no to the selling or sharing of their personal information</li>
            <li>Access their personal information</li>
            <li>Request deletion of personal information collected from them</li>
          </ul>
        </section>
      </div>
    </Layout>
  );
}
