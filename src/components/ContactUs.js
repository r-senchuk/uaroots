import { useState } from "react";

function ContactUs() {
  const [email, setEmail] = useState(""),
    [name, setName] = useState(""),
    namePlaceholder = "Ім'я",
    [phone, setPhone] = useState(""),
    phonePlaceholder = "Телефон",
    [department, setDepartment] = useState(""),
    [member, setMember] = useState(""),
    [subject, setSubject] = useState(""),
    [question, setQuestion] = useState("");

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  const handlePhoneChange = (e) => {
    setPhone(e.target.value);
  };

  return (
    <div className="container">

      <form
        className="block"
        method="put"
        action="https://4jtzwjgt99.execute-api.eu-central-1.amazonaws.com/prod/contactcrew"
      >
        <div className="field is-horizontal">
          <div className="field-label is-normal">
            <label className="label">Від</label>
          </div>
          <div className="field-body">
            <div className="field">
              <p className="control is-expanded has-icons-left">
                <input
                  className="input"
                  type="text"
                  value={name}
                  onChange={handleNameChange}
                  placeholder={namePlaceholder}
                />
                <span className="icon is-small is-left">
                  <i className="fas fa-user"></i>
                </span>
              </p>
            </div>
            <div className="field">
              <p className="control is-expanded has-icons-left has-icons-right">
                <input
                  className="input is-success"
                  type="email"
                  onChange={handleEmailChange}
                  placeholder="E-mail"
                  value={email}
                />
                <span className="icon is-small is-left">
                  <i className="fas fa-envelope"></i>
                </span>
                <span className="icon is-small is-right">
                  <i className="fas fa-check"></i>
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="field is-horizontal">
          <div className="field-label"></div>
          <div className="field-body">
            <div className="field is-expanded">
              <div className="field has-addons">
                <p className="control"></p>
                <p className="control is-expanded">
                  <input
                    className="input"
                    type="tel"
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder={phonePlaceholder}
                  />
                </p>
              </div>
              <p className="help">Do not enter the first zero</p>
            </div>
          </div>
        </div>

        <div className="field is-horizontal">
          <div className="field-label is-normal">
            <label className="label">Subject</label>
          </div>
          <div className="field-body">
            <div className="field">
              <div className="control">
                <input
                  className="input is-danger"
                  type="text"
                  placeholder="e.g. Partnership opportunity"
                />
              </div>
              <p className="help is-danger">This field is required</p>
            </div>
          </div>
        </div>

        <div className="field is-horizontal">
          <div className="field-label is-normal">
            <label className="label">Question</label>
          </div>
          <div className="field-body">
            <div className="field">
              <div className="control">
                <textarea
                  className="textarea"
                  placeholder="Explain how we can help you"
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        <div className="field is-horizontal">
          <div className="field-label"></div>
          <div className="field-body">
            <div className="field">
              <div className="control">
                <button className="button is-primary">Send message</button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default ContactUs;
