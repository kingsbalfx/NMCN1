import Layout from "../components/Layout";

export default function Terms() {
  return (
    <Layout>
      <div className="container" style={{ maxWidth: '900px', margin: '40px auto', paddingBottom: '60px' }}>
        <h1 style={{ marginBottom: '30px', color: '#0066ff' }}>Terms of Service</h1>
        
        <p style={{ color: '#64748b', marginBottom: '20px', fontStyle: 'italic' }}>
          Last updated: February 2026
        </p>

        <section style={{ marginBottom: '40px' }}>
          <h3>1. Agreement to Terms</h3>
          <p>By accessing and using the Kingsbal Digital Healthcare Bridge platform, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.</p>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h3>2. Use License</h3>
          <p>Permission is granted to temporarily download one copy of the materials (including information and software) from Kingsbal for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
          <ul style={{ marginLeft: '20px', marginBottom: '20px' }}>
            <li>Modify or copy the materials</li>
            <li>Use the materials for any commercial purpose or for any public display</li>
            <li>Attempt to decompile or reverse engineer any software contained on Kingsbal</li>
            <li>Remove any copyright or other proprietary notations from the materials</li>
            <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
          </ul>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h3>3. Disclaimer</h3>
          <p>The materials on Kingsbal are provided on an 'as is' basis. Kingsbal makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h3>4. Limitations</h3>
          <p>In no event shall Kingsbal or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Kingsbal, even if Kingsbal or a Kingsbal authorized representative has been notified orally or in writing of the possibility of such damage.</p>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h3>5. Accuracy of Materials</h3>
          <p>The materials appearing on Kingsbal could include technical, typographical, or photographic errors. Kingsbal does not warrant that any of the materials on Kingsbal are accurate, complete, or current. Kingsbal may make changes to the materials contained on Kingsbal at any time without notice.</p>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h3>6. Links</h3>
          <p>Kingsbal has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by Kingsbal of the site. Use of any such linked website is at the user's own risk.</p>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h3>7. Modifications</h3>
          <p>Kingsbal may revise these terms of service for its website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.</p>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h3>8. Governing Law</h3>
          <p>These terms and conditions are governed by and construed in accordance with the laws of Nigeria, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.</p>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h3>9. Contact Information</h3>
          <p>If you have any questions about these Terms of Service, please contact us at:</p>
          <p>
            <strong>WhatsApp:</strong> <a href={process.env.NEXT_PUBLIC_WHATSAPP_URL || 'https://wa.me/2347000000000'}>Message us</a><br />
            <strong>Email:</strong> support@kingsbal.com
          </p>
        </section>
      </div>
    </Layout>
  );
}
