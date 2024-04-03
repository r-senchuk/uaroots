function ContactUs() {
  return (
    <div className="cl2-right clrght-blue">
      <div id="contactus">
        <h2>Contact Us</h2>
        <div className="formdiv">
          <p>
            Share a bit about your project through our contact form, and we'll
            ensure the appropriate team member gets in touch.
          </p>
          <p>
            or email us:
            <a href="mailto:info@crewbravo.com">info@crewbravo.com</a>
          </p>
          <form
            method="put"
            action="https://4jtzwjgt99.execute-api.eu-central-1.amazonaws.com/prod/contactcrew"
          >
            <label>
              <input
                className="form__element"
                type="text"
                placeholder="Name*"
                id="name"
                required
                title="Introduce yourself"
                minlength="2"
                name="visitor_name"
              />
              <small id="error-name-length" className="error error-length">
                Min len 2
              </small>
              <small id="error-name-required" className="error error-required">
                Required
              </small>
            </label>
            <label>
              <input
                className="form__element"
                type="email"
                id="email"
                required
                title="Where we can respond to you"
                placeholder="Email*"
                name="visitor_email"
              />
              <small id="error-email-invalid" className="error error-invalid">
                Looks like as a not real email
              </small>
              <small id="error-email-required" className="error error-required">
                Where we can respond to you
              </small>
            </label>
            <input
              className="form__element"
              type="tel"
              id="phone"
              title="If you prefer to be contacted by phone instead of email"
              placeholder="Phone"
              name="visitor_phone"
            />
            <input
              className="form__element"
              id="company"
              placeholder="Company"
              title="We'll find more about your company by it's name, if applicable"
              name="visitor_company"
            />
            <label>
              <textarea
                id="message"
                className="form__element"
                placeholder="Share with us brief details...*"
                required
                minlength="50"
                name="visitor_message"
              ></textarea>
              <small>
                <span id="message-length" className="message-length">
                  0
                </span>
                /<span id="min-message-length"> at least 10 characters</span>
              </small>
              <small id="error-message-required" className="error error-required">
                Required
              </small>
            </label>
            <div className="flex-center">
              <button type="button" disabled id="messageSubmit" className="button">
                Send Message
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ContactUs;
