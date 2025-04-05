import { saveReport } from "./db.js";

document.addEventListener("DOMContentLoaded", function () {
  // ======= Mobile Navigation Toggle =======
  const hamburger = document.querySelector(".hamburger");
  const navLinks = document.querySelector(".nav-links");

  if (hamburger) {
    hamburger.addEventListener("click", function () {
      this.classList.toggle("active");
      navLinks.classList.toggle("active");
    });
  }

  const navItems = document.querySelectorAll(".nav-links a");
  navItems.forEach((item) => {
    item.addEventListener("click", function () {
      if (navLinks.classList.contains("active")) {
        navLinks.classList.remove("active");
        hamburger.classList.remove("active");
      }
    });
  });

  // ======= Form Elements =======
  const form = document.getElementById("wasteReportForm");
  const imageUpload = document.getElementById("imageUpload");
  const imagePreview = document.getElementById("imagePreview");
  const submitButton = document.getElementById("submitReport");
  const gpsButton = document.getElementById("getGPS");
  const anonymousCheckbox = document.getElementById("reportAnonymously");
  const contactSection = document.getElementById("contactSection");
  const confirmationMessage = document.getElementById("confirmationMessage");
  const DismissBtn = document.getElementById("dismiss_btn");

  let uploadedImages = [];

  let formValidation = {
    location: false,
    description: false,
    wasteType: false,
    urgency: false,
    contact: false,
  };

  if (gpsButton) {
    gpsButton.addEventListener("click", async function () {
      const buttonText = this.querySelector(".button-text");
      const spinner = this.querySelector(".loading-spinner");

      this.disabled = true;
      buttonText.textContent = "Getting Location...";
      spinner.classList.remove("hidden");

      try {
        const position = await getCurrentPosition();
        const location = document.getElementById("location");
        location.value = `Lat: ${position.coords.latitude}, Long: ${position.coords.longitude}`;
        validateField("location", location);
      } catch (error) {
        showError("Error getting location: " + error.message);
      } finally {
        this.disabled = false;
        buttonText.textContent = "Use GPS Location";
        spinner.classList.add("hidden");
      }
    });
  }

  function getCurrentPosition() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported"));
      }
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
  }

  imageUpload.addEventListener("change", function (e) {
    const files = Array.from(e.target.files);

    if (uploadedImages.length + files.length > 3) {
      alert("Maximum 3 images allowed");
      return;
    }

    files.forEach((file) => {
      if (!file.type.match("image.*")) {
        alert("Please upload only image files");
        return;
      }

      const reader = new FileReader();
      reader.onload = function (e) {
        const imageDiv = document.createElement("div");
        imageDiv.className = "image-preview";
        imageDiv.innerHTML = `
          <img src="${e.target.result}" alt="Preview">
          <button type="button" class="remove-image">&times;</button>
        `;

        imagePreview.appendChild(imageDiv);
        uploadedImages.push(file);

        imageDiv
          .querySelector(".remove-image")
          .addEventListener("click", function () {
            imageDiv.remove();
            uploadedImages = uploadedImages.filter((img) => img !== file);
            // updateSubmitButton();
          });

        // updateSubmitButton();
      };
      reader.readAsDataURL(file);
    });
  });

  function validateField(fieldName, element) {
    const value = element.value.trim();
    let isValid = false;

    switch (fieldName) {
      case "location":
        isValid = value.length >= 5;
        break;
      case "description":
        isValid = value.length >= 20;
        break;
      case "wasteType":
        isValid =
          document.querySelectorAll('input[name="wasteType"]:checked').length >
          0;
        break;
      case "urgency":
        isValid =
          document.querySelector('input[name="urgency"]:checked') !== null;
        break;
      case "contact":
        if (anonymousCheckbox.checked) {
          isValid = true;
        } else {
          const email = document.getElementById("email").value.trim();
          const phone = document.getElementById("phone").value.trim();
          isValid = email !== "" || phone !== "";
        }
        break;
    }

    formValidation[fieldName] = isValid;
    updateFormStatus(element, isValid);
    // updateSubmitButton();
  }

  function updateFormStatus(element, isValid) {
    const formGroup = element.closest(".form-group");
    if (formGroup) {
      formGroup.classList.remove("valid", "invalid");
      formGroup.classList.add(isValid ? "valid" : "invalid");
    }
  }

  // function updateSubmitButton() {
  //   const isFormValid =
  //     Object.values(formValidation).every((v) => v === true) &&
  //     uploadedImages.length > 0;
  //   submitButton.disabled = !isFormValid;
  // }

  if (DismissBtn) {
    DismissBtn.addEventListener("click", function () {
      confirmationMessage.classList.add("hidden");
    });
  }

  document
    .getElementById("location")
    .addEventListener("input", (e) => validateField("location", e.target));
  document
    .getElementById("description")
    .addEventListener("input", (e) => validateField("description", e.target));
  document
    .querySelectorAll('input[name="wasteType"]')
    .forEach((cb) =>
      cb.addEventListener("change", () => validateField("wasteType", cb))
    );
  document
    .querySelectorAll('input[name="urgency"]')
    .forEach((rb) =>
      rb.addEventListener("change", () => validateField("urgency", rb))
    );
  document
    .getElementById("email")
    .addEventListener("input", () =>
      validateField("contact", document.getElementById("email"))
    );
  document
    .getElementById("phone")
    .addEventListener("input", () =>
      validateField("contact", document.getElementById("phone"))
    );

  anonymousCheckbox.addEventListener("change", function () {
    contactSection.style.display = this.checked ? "none" : "block";
    validateField("contact", document.getElementById("email"));
  });

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    // if (!Object.values(formValidation).every((v) => v === true)) {
    //   alert("Please complete all required fields correctly.");
    //   return;
    // }

    // Create report object
    const report = {
      location: document.getElementById("location").value.trim(),
      description: document.getElementById("description").value.trim(),
      wasteType: Array.from(
        document.querySelectorAll('input[name="wasteType"]:checked')
      ).map((el) => el.value),
      urgency:
        document.querySelector('input[name="urgency"]:checked')?.value || "",
      anonymous: anonymousCheckbox.checked,
      contact: {
        email: document.getElementById("email").value.trim(),
        phone: document.getElementById("phone").value.trim(),
      },
      images: await Promise.all(uploadedImages.map(readFileAsDataURL)),
    };

    try {
      await saveReport(report);
      confirmationMessage.classList.remove("hidden");
      resetForm();
    } catch (err) {
      console.error("Error saving report:", err);
      alert("Failed to save report.");
    }
  });

  // Helper to read file as base64
  function readFileAsDataURL(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });
  }

  window.resetForm = function () {
    form.reset();
    imagePreview.innerHTML = "";
    uploadedImages = [];

    Object.keys(formValidation).forEach((key) => {
      formValidation[key] = false;
    });

    // submitButton.disabled = true;
  };

  function showError(message) {
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.textContent = message;

    gpsButton.parentNode.insertBefore(errorDiv, gpsButton.nextSibling);
    setTimeout(() => errorDiv.remove(), 3000);
  }
});
