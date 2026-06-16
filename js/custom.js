document.addEventListener("DOMContentLoaded", function () {

    'use strict';

    // ------------------ AOS ------------------
    AOS.init({
        duration: 800,
        easing: 'slide',
        once: true
    });

    // ------------------ Preloader ------------------
    var loader = document.querySelector('.loader');
    var overlay = document.getElementById('overlayer');

    function fadeOut(el) {
        if (!el) return;
        el.style.opacity = 1;
        (function fade() {
            if ((el.style.opacity -= .1) < 0) {
                el.style.display = "none";
            } else {
                requestAnimationFrame(fade);
            }
        })();
    }

    setTimeout(function () {
        fadeOut(loader);
        fadeOut(overlay);
    }, 200);


    // ------------------ Tiny Slider ------------------
    var slider = document.querySelectorAll('.features-slider');
    var postSlider = document.querySelectorAll('.post-slider');
    var testimonialSlider = document.querySelectorAll('.testimonial-slider');

    if (slider.length > 0) {
        tns({
            container: '.features-slider',
            mode: 'carousel',
            speed: 700,
            items: 3,
            gutter: 30,
            loop: false,
            edgePadding: 80,
            controlsPosition: 'bottom',
            nav: false,
            controlsContainer: '#features-slider-nav',
            responsive: {
                0: { items: 1 },
                700: { items: 2 },
                900: { items: 3 }
            }
        });
    }

    if (postSlider.length > 0) {
        tns({
            container: '.post-slider',
            mode: 'carousel',
            speed: 700,
            items: 3,
            gutter: 30,
            loop: true,
            edgePadding: 10,
            controlsPosition: 'bottom',
            navPosition: 'bottom',
            nav: true,
            autoplay: true,
            autoplayButtonOutput: false,
            controlsContainer: '#post-slider-nav',
            responsive: {
                0: { items: 1 },
                700: { items: 2 },
                900: { items: 3 }
            }
        });
    }

    if (testimonialSlider.length > 0) {
        tns({
            container: '.testimonial-slider',
            mode: 'carousel',
            speed: 700,
            items: 1,
            gutter: 30,
            loop: true,
            edgePadding: 10,
            controlsPosition: 'bottom',
            navPosition: 'bottom',
            nav: true,
            autoplay: true,
            autoplayButtonOutput: false,
            controlsContainer: '#testimonial-slider-nav',
            controls: false,
            responsive: {
                0: { items: 1 },
                700: { items: 1 },
                900: { items: 1 }
            }
        });
    }

    // ------------------ Membership Certificate ------------------
    var membershipForm = document.getElementById('membershipForm');
    var membershipSubmitBtn = document.getElementById('membershipSubmitBtn');
    if (membershipForm && membershipSubmitBtn) {
        membershipSubmitBtn.addEventListener('click', function (event) {
            event.preventDefault();

            var name = document.getElementById('memberName').value.trim();
            var email = document.getElementById('memberEmail').value.trim();
            var phone = document.getElementById('memberPhone').value.trim();
            var city = document.getElementById('memberCity').value.trim();

            if (!name || !email || !phone || !city) {
                alert('Please fill all membership details.');
                return;
            }

            var membershipId = generateMembershipId();
            var certificateText = buildCertificateText(name, email, phone, city, membershipId);
            downloadCertificate(certificateText, membershipId, name, email, phone, city);
            triggerEmailNotification(name, email, phone, city, membershipId);

            var membershipModal = document.getElementById('membershipModal');
            if (membershipModal) {
                var bsModal = bootstrap.Modal.getInstance(membershipModal);
                if (bsModal) {
                    bsModal.hide();
                }
            }

            membershipForm.reset();
        });
    }

    function generateMembershipId() {
        var datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        var randomPart = Math.random().toString(36).substring(2, 7).toUpperCase();
        return datePart + '-JSU' + randomPart;
    }

    function buildCertificateText(name, email, phone, city, membershipId) {
        return 'Membership ID: ' + membershipId + '\n' +
            'Date: ' + new Date().toLocaleDateString('en-IN') + '\n' +
            'Name: ' + name + '\n' +
            'Email: ' + email + '\n' +
            'Phone: ' + phone + '\n' +
            'City: ' + city;
    }

    function triggerEmailNotification(name, email, phone, city, membershipId) {
        var frameName = 'membershipEmailFrame';
        var frame = document.getElementById(frameName);
        if (!frame) {
            frame = document.createElement('iframe');
            frame.id = frameName;
            frame.name = frameName;
            frame.style.display = 'none';
            document.body.appendChild(frame);
        }

        var form = document.createElement('form');
        form.action = 'https://formsubmit.co/abhireducationalfoundation@gmail.com';
        form.method = 'POST';
        form.target = frameName;
        form.style.display = 'none';

        var fields = [
            ['_captcha', 'false'],
            ['_template', 'table'],
            ['_subject', 'New Membership Registration: ' + membershipId],
            ['_cc', 'gaur.gulshan@gmail.com'],
            ['name', name],
            ['email', email],
            ['phone', phone],
            ['city', city],
            ['membershipId', membershipId],
            ['message', 'New membership registration. Please process this new member request.']
        ];

        fields.forEach(function (field) {
            var input = document.createElement('input');
            input.type = 'hidden';
            input.name = field[0];
            input.value = field[1];
            form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
        setTimeout(function () {
            document.body.removeChild(form);
        }, 5000);
    }

    function downloadCertificate(content, membershipId, name, email, phone, city) {

        var jsPDF = window.jspdf && window.jspdf.jsPDF ? window.jspdf.jsPDF : window.jsPDF;

        if (!jsPDF) {
            alert('PDF library not loaded.');
            return;
        }

        var doc = new jsPDF({
            orientation: 'portrait',
            unit: 'pt',
            format: 'a4'
        });

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        // Border
        doc.setDrawColor(180, 140, 40);
        doc.setLineWidth(3);
        doc.rect(20, 20, pageWidth - 40, pageHeight - 40);

        doc.setLineWidth(1);
        doc.rect(30, 30, pageWidth - 60, pageHeight - 60);

        // Watermark
        doc.setTextColor(245, 245, 245);
        doc.setFontSize(70);
        doc.text("AEF", pageWidth / 2, pageHeight / 2, {
            align: "center",
            angle: 45
        });

        // Reset color
        doc.setTextColor(0, 0, 0);

        // Logo
        var logo = new Image();
        logo.src = 'images/logo-new.png';

        logo.onload = function () {

            try {
                doc.addImage(
                    logo,
                    'PNG',
                    (pageWidth - 90) / 2,
                    45,
                    90,
                    90
                );
            } catch (e) { }

            generatePdf();
        };

        logo.onerror = function () {
            generatePdf();
        };

        function generatePdf() {

            let y = 170;

            // Foundation Name
            doc.setFont("helvetica", "bold");
            doc.setFontSize(24);

            doc.text(
                "ABHIR EDUCATIONAL FOUNDATION",
                pageWidth / 2,
                y,
                { align: "center" }
            );

            y += 35;

            // Certificate Heading
            doc.setTextColor(180, 140, 40);

            doc.setFontSize(20);

            doc.text(
                "MEMBERSHIP CERTIFICATE",
                pageWidth / 2,
                y,
                { align: "center" }
            );

            doc.setTextColor(0, 0, 0);

            y += 55;

            // Presented To
            doc.setFont("times", "italic");
            doc.setFontSize(14);

            doc.text(
                "This certificate is proudly presented to",
                pageWidth / 2,
                y,
                { align: "center" }
            );

            y += 40;

            // Member Name
            doc.setFont("times", "bold");
            doc.setFontSize(28);

            doc.text(
                name.toUpperCase(),
                pageWidth / 2,
                y,
                { align: "center" }
            );

            y += 35;

            doc.setFont("times", "normal");
            doc.setFontSize(14);

            doc.text(
                "for becoming an official member of",
                pageWidth / 2,
                y,
                { align: "center" }
            );

            y += 25;

            doc.setFont("times", "bold");
            doc.setFontSize(18);

            doc.text(
                "ABHIR EDUCATIONAL FOUNDATION",
                pageWidth / 2,
                y,
                { align: "center" }
            );

            y += 50;

            // Details Box
            doc.roundedRect(
                90,
                y,
                pageWidth - 180,
                140,
                5,
                5
            );

            let boxY = y + 25;

            doc.setFont("helvetica", "normal");
            doc.setFontSize(12);

            doc.text(
                "Membership ID: " + membershipId,
                110,
                boxY
            );

            boxY += 25;

            doc.text(
                "Email: " + email,
                110,
                boxY
            );

            boxY += 25;

            doc.text(
                "Phone: " + phone,
                110,
                boxY
            );

            boxY += 25;

            doc.text(
                "City: " + city,
                110,
                boxY
            );

            y += 220;

            // ===== ISSUE DATE (LEFT) =====
            doc.setFont("helvetica", "normal");
            doc.setFontSize(12);

            doc.text(
                "Issue Date: " + new Date().toLocaleDateString('en-IN'),
                80,
                y
            );

            // ===== SIGNATURE (RIGHT) =====
            doc.line(
                pageWidth - 180,
                y - 10,
                pageWidth - 60,
                y - 10
            );

            doc.setFont("helvetica", "bold");

            doc.text(
                "Bharti",
                pageWidth - 170,
                y + 10
            );

            doc.setFont("helvetica", "normal");

            doc.text(
                "Authorized Signatory",
                pageWidth - 170,
                y + 28
            );

            // Footer
            doc.setFontSize(10);

            doc.text(
                "This certificate is system generated and valid without physical signature.",
                pageWidth / 2,
                pageHeight - 35,
                { align: "center" }
            );

            doc.save(
                'Membership-Certificate-' + membershipId + '.pdf'
            );
        }
    }

    function renderCertificateText(doc, content, membershipId, x, y, lineHeight) {

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        // ===== BORDER =====
        doc.setDrawColor(180, 140, 40);
        doc.setLineWidth(3);
        doc.rect(20, 20, pageWidth - 40, pageHeight - 40);

        doc.setLineWidth(1);
        doc.rect(30, 30, pageWidth - 60, pageHeight - 60);

        // ===== WATERMARK =====
        doc.setTextColor(240, 240, 240);
        doc.setFontSize(60);
        doc.text("AEF", pageWidth / 2, pageHeight / 2, {
            align: "center",
            angle: 45
        });

        // ===== TITLE =====
        doc.setTextColor(0, 0, 0);

        y += 20;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(28);

        doc.text(
            "ABHIR EDUCATIONAL FOUNDATION",
            pageWidth / 2,
            y,
            { align: "center" }
        );

        y += 35;

        doc.setFontSize(22);
        doc.setTextColor(180, 140, 40);

        doc.text(
            "MEMBERSHIP CERTIFICATE",
            pageWidth / 2,
            y,
            { align: "center" }
        );

        y += 50;

        // ===== CERTIFICATE TEXT =====
        doc.setTextColor(0, 0, 0);

        doc.setFont("times", "italic");
        doc.setFontSize(16);

        doc.text(
            "This certificate is proudly presented to",
            pageWidth / 2,
            y,
            { align: "center" }
        );

        y += 40;

        // ===== MEMBER NAME =====
        const memberName =
            document.getElementById('memberName').value;

        doc.setFont("times", "bold");
        doc.setFontSize(28);

        doc.text(
            memberName.toUpperCase(),
            pageWidth / 2,
            y,
            { align: "center" }
        );

        y += 35;

        doc.setFont("times", "normal");
        doc.setFontSize(14);

        doc.text(
            "for becoming an official member of",
            pageWidth / 2,
            y,
            { align: "center" }
        );

        y += 25;

        doc.setFont("times", "bold");
        doc.setFontSize(18);

        doc.text(
            "ABHIR EDUCATIONAL FOUNDATION",
            pageWidth / 2,
            y,
            { align: "center" }
        );

        y += 60;

        // ===== DETAILS BOX =====
        doc.roundedRect(100, y, pageWidth - 200, 120, 5, 5);

        let boxY = y + 25;

        const email = document.getElementById('memberEmail').value;
        const phone = document.getElementById('memberPhone').value;
        const city = document.getElementById('memberCity').value;

        doc.setFontSize(12);

        doc.text(`Membership ID: ${membershipId}`, 120, boxY);
        boxY += 25;

        doc.text(`Email: ${email}`, 120, boxY);
        boxY += 25;

        doc.text(`Phone: ${phone}`, 120, boxY);
        boxY += 25;

        doc.text(`City: ${city}`, 120, boxY);

        y += 180;

        // ===== DATE =====
        doc.setFontSize(12);

        doc.text(
            "Issue Date: " + new Date().toLocaleDateString('en-IN'),
            80,
            y
        );

        // ===== SIGNATURE =====
        doc.line(
            pageWidth - 180,
            y - 10,
            pageWidth - 60,
            y - 10
        );

        doc.text(
            "Authorized Signatory",
            pageWidth - 170,
            y + 10
        );

        // ===== FOOTER =====
        doc.setFontSize(10);

        doc.text(
            "This certificate is system generated and does not require a physical signature.",
            pageWidth / 2,
            pageHeight - 40,
            { align: "center" }
        );
    }
});
