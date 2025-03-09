export default async function sendEmail(Email: any) {
    try {
      const response = await fetch('/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: Email,
          subject: "Thank you for Subscribing to our Newsletter",
          html: `
    <p>We are glad to have you become part of our community at MDENTCARE!</p>
    <p>You will continuously receive updates on our latest news and offers.</p>
    <p>
      <a target="_blank"  rel="noopener noreferrer"  href="http://localhost:3000/unsubscribePage?email=${encodeURIComponent(Email)}" style="color: #007bff; text-decoration: none;">
        Unsubscribe anytime
      </a>
    </p>
  `,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log(data.message);
        return { success: true, message: data.message }
      } else {
        console.log(`Error: ${data.message}`);
        return { success: false, message: data.message }; // Return error response
      }
    } catch (error) {
      console.error('An error occurred while sending the email.');
      console.error(error);
    }
  };

  export async function sendDismissalEmail(Email: any) {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/send-email`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              to: Email,
              subject: "We Are Sorry to See You Leave",
              html: `
        <p><strong> Thank  you for being part of our community at MDENTCARE! for all this time You are always welcome </strong></p> `,
            }),
          });
    
          const data = await response.json();
          if (response.ok) {
            console.log(data.message);
            return { success: true, message: data.message }
          } else {
            console.log(`Error: ${data.message}`);
            return { success: false, message: data.message }; // Return error response
          }
        } catch (error) {
          console.error('An error occurred while sending the email.');
          console.error(error);
        }
      };
    
    