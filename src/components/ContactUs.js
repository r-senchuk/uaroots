import { useState, useRef } from "react";

function ContactUs() {
  const [email, setEmail] = useState(""),
    emailInput = useRef(),
    isValidEmail = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/g,
    [name, setName] = useState(""),
    namePlaceholder = "Ім'я",
    [phone, setPhone] = useState(""),
    phonePlaceholder = "Телефон",
    [question, setQuestion] = useState("");

  const handleEmailChange = (e) => {
    if (e.target?.value) {
      e.target.value.match(isValidEmail)
        ? showNoValidEmail(false)
        : showNoValidEmail(true);
      setEmail(e.target.value);
    }
  };

  const showNoValidEmail = (show) => {
    if (show) {
      emailInput.current.classList.add("is-danger");
    } else {
      emailInput.current.classList.remove("is-danger");
    }
  };

  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  const handlePhoneChange = (e) => {
    setPhone(e.target.value);
  };

  const handleQuestionChange = (e) => {
    setQuestion(e.target.value);
  };

  return (
    <div className="container">
      <br />
      <form
        className="block"
        method="put"
        action="https://4jtzwjgt99.execute-api.eu-central-1.amazonaws.com/prod/contactcrew"
      >
        <div className="field is-horizontal">
          <div className="field-label">
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
          </div>
        </div>

        <div className="field is-horizontal">
          <div className="field-label is-normal"></div>
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
              <p className="help">
                введіть з кодом країни (наприклад: +380...)
              </p>
            </div>
            <div className="field">
              <p className="control is-expanded has-icons-left has-icons-right">
                <input
                  className="input is-success"
                  type="email"
                  ref={emailInput}
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
          <div className="field-label is-normal">
            <label className="label">Текст повідомлення</label>
          </div>
          <div className="field-body">
            <div className="field">
              <div className="control">
                <textarea
                  onChange={handleQuestionChange}
                  className="textarea"
                  value={question}
                  placeholder="Чим можемо допомогти?"
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
                <button className="button is-primary">Надіслати</button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default ContactUs;
