document.addEventListener("DOMContentLoaded", function () {
  // Mobile Navigation Toggle
  const hamburger = document.querySelector(".hamburger");
  const navLinks = document.querySelector(".nav-links");

  if (hamburger) {
    hamburger.addEventListener("click", function () {
      navLinks.classList.toggle("active");
    });
  }

  // Close mobile menu when a link is clicked
  const navItems = document.querySelectorAll(".nav-links a");
  navItems.forEach((item) => {
    item.addEventListener("click", function () {
      if (navLinks.classList.contains("active")) {
        navLinks.classList.remove("active");
      }
    });
  });

  // Form Validation
  const wasteReportForm = document.getElementById("waste-report-form");

    anonymousCheckbox.addEventListener("change", function () {
        document.getElementById("contact").removeAttribute("required");
      } else {
        contactFields.style.display = "block";
        // Add required attribute back to contact field
        document.getElementById("contact").setAttribute("required", "");
      }
    });
  }

  // Form Validation
  if (wasteReportForm) {
    // Initial submit button state
    updateSubmitButtonState();

    wasteReportForm.addEventListener("submit", function (e) {
      e.preventDefault();

      let isValid = true;

      // Clear previous error messages
      const errorMessages = document.querySelectorAll(".error-message");
      errorMessages.forEach((message) => {
        message.textContent = "";
      });

      // Validate location
      const location = document.getElementById("location");
      if (!location.value.trim()) {
        document.getElementById("location-error").textContent =
          "Please enter a location";
        isValid = false;
      }

      // Validate description
      const description = document.getElementById("description");
      if (!description.value.trim()) {

      // Validate contact information
      const contact = document.getElementById("contact");
      if (!contact.value.trim()) {
        document.getElementById("contact-error").textContent =
          "Please enter your contact information";
        isValid = false;
      } else {
        // Simple validation for email or phone
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^[\d\s\-\(\)\+]+$/;
        document.getElementById("urgency-error").textContent =
        if (
          !emailRegex.test(contact.value) &&
          !phoneRegex.test(contact.value)
        ) {
          document.getElementById("contact-error").textContent =
            "Please enter a valid email or phone number";
          isValid = false;
          document.getElementById("contact-error").textContent =
            "Please enter your contact information";
          isValid = false;
      // If form is valid, submit it (or show success message for demo)
          // Simple validation for email or phone
        // For demo purposes, just show an alert
        alert("Thank you for your report! Our team will review it shortly.");
        wasteReportForm.reset();
        successMessage.classList.add("show");

        // wasteReportForm.submit();
            document.getElementById("contact").setAttribute("required", "");
          }
        }, 100);

        // In a real application, you would submit the form data to a server
        // const formData = new FormData(wasteReportForm);
        // for (let i = 0; i < uploadedImages.length; i++) {
        //   formData.append('images[]', uploadedImages[i].file);
        // }
        // fetch('/submit-report', {
        //   method: 'POST',
        //   body: formData
        // })
        // .then(response => response.json())
        // .then(data => console.log(data))
        // .catch(error => console.error('Error:', error));
      }
    });
  }
});
