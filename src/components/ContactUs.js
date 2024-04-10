import { useState, useRef, useEffect } from "react";

function ContactUs() {
  const API_URL =
      "https://4jtzwjgt99.execute-api.eu-central-1.amazonaws.com/prod/contactcrew",
    [email, setEmail] = useState(""),
    emailInput = useRef(),
    emailCheckMark = useRef(),
    isValidEmail = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/g,
    [name, setName] = useState(""),
    nameRef = useRef(),
    namePlaceholder = "Ім'я",
    [phone, setPhone] = useState(""),
    phoneInpRef = useRef(),
    phonePlaceholder = "Телефон",
    [question, setQuestion] = useState(""),
    [isSubmitDisabled, setSubmitDisabled] = useState(true);

  useEffect(() => {
    if (
      nameRef.current.valid &&
      (emailInput.current.valid || phoneInpRef.current.valid) &&
      question.length > 10
    ) {
      setSubmitDisabled(false);
    } else {
      setSubmitDisabled(true);
    }
  }, [name, email, phone, question]);

  const handleEmailChange = (e) => {
    if (e.target?.value) {
      e.target.value.match(isValidEmail)
        ? showEmailNotValid(false)
        : showEmailNotValid(true);
    } else {
      showEmailNotValid(false);
    }
    setEmail(e.target.value);
  };

  const showEmailNotValid = (show) => {
    if (show) {
      emailInput.current.valid = false;
      emailInput.current.classList.add("is-danger");
      emailCheckMark.current.classList.add("is-hidden");
    } else {
      emailInput.current.valid = true;
      emailInput.current.classList.remove("is-danger");
      emailCheckMark.current.classList.remove("is-hidden");
    }
  };

  const handleNameChange = (e) => {
    let name = e.target.value;
    if (name.match(/\p{Letter}/gu) && name.length > 2) {
      nameRef.current.valid = true;
      nameRef.current.classList.remove("is-danger");
    } else {
      nameRef.current.classList.add("is-danger");
      nameRef.current.valid = false;
    }
    setName(name);
  };

  const handlePhoneChange = (e) => {
    let phone = e.target.value;
    setPhone(phone);
    if (phone.match(/^[\d\s+]{8,}$/)) {
      e.target.classList.remove("is-danger");
      phoneInpRef.current.valid = true;
    } else {
      e.target.classList.add("is-danger");
      phoneInpRef.current.valid = false;
    }
  };

  const handleQuestionChange = (e) => {
    setQuestion(e.target.value);
    if (e.target.value.length > 10) {
      e.target.classList.remove("is-danger");
      e.target.valid = true;
    } else {
      e.target.classList.add("is-danger");
      e.target.valid = false;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let data = {
      name,
      email,
      phone,
      question,
    };
    fetch(API_URL, {
      method: "PUT",
      mode: "cors",
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.status === "success") {
          alert("Повідомлення надіслано!");
          setEmail("");
          setName("");
          setPhone("");
          setQuestion("");
        }
      })
      .catch((err) => {
        alert("Помилка надсилання повідомлення");
        console.log(err);
      });
  };

  return (
    <div className="container">
      <br />
      <form className="block" onSubmit={handleSubmit}>
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
                  ref={nameRef}
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
                    ref={phoneInpRef}
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
                  className="input"
                  type="email"
                  ref={emailInput}
                  onChange={handleEmailChange}
                  placeholder="E-mail"
                  value={email}
                />
                <span className="icon is-small is-left">
                  <i className="fas fa-envelope"></i>
                </span>
                <span ref={emailCheckMark} className="icon is-small">
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
                <button
                  type="submit"
                  disabled={isSubmitDisabled}
                  className="button is-primary"
                >
                  Надіслати
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default ContactUs;
