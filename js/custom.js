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

    setTimeout(function() {
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
            downloadCertificate(certificateText, membershipId);
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
        form.action = 'https://formsubmit.co/gaur.gulshan@gail.com';
        form.method = 'POST';
        form.target = frameName;
        form.style.display = 'none';

        var fields = [
            ['_captcha', 'false'],
            ['_template', 'table'],
            ['_subject', 'New Membership Registration: ' + membershipId],
            ['_cc', 'guria.gaur@gail.com'],
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

    function downloadCertificate(content, membershipId) {
        var jsPDF = window.jspdf && window.jspdf.jsPDF ? window.jspdf.jsPDF : window.jsPDF;
        if (!jsPDF) {
            alert('PDF library not loaded. Please try again later.');
            return;
        }

        var doc = new jsPDF({ unit: 'pt', format: 'a4' });
        var lineHeight = 22;
        var margin = 40;
        var x = margin;
        var y = 10;
        var pageWidth = doc.internal.pageSize.getWidth();

        var logo = new Image();
        logo.src = 'images/logo-new.png';
        logo.onload = function () {
            var logoWidth = 120;
            var logoHeight = 120;
            var logoX = (pageWidth - logoWidth) / 2;

            try {
                doc.addImage(logo, 'PNG', logoX, y, logoWidth, logoHeight);
            } catch (error) {
                console.warn('Logo could not be embedded in PDF:', error);
            }

            y += logoHeight + 20;
            renderCertificateText(doc, content, membershipId, x, y, lineHeight);
            doc.save('Membership-Certificate-' + membershipId + '.pdf');
        };

        logo.onerror = function () {
            y += 0;
            renderCertificateText(doc, content, membershipId, x, y, lineHeight);
            doc.save('Membership-Certificate-' + membershipId + '.pdf');
        };
    }

    function renderCertificateText(doc, content, membershipId, x, y, lineHeight) {
        var pageWidth = doc.internal.pageSize.getWidth();
        
        y += 20;
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        var orgText = 'Abhir Educational Foundation';
        var orgWidth = doc.getTextWidth(orgText);
        doc.text(orgText, (pageWidth - orgWidth) / 2, y);

        y += 30;
        doc.setFontSize(18);
        doc.setFont('helvetica', 'normal');
        var certText = 'Membership Certificate';
        var certWidth = doc.getTextWidth(certText);
        doc.text(certText, (pageWidth - certWidth) / 2, y);

        y += 60;
        doc.setFontSize(12);
        var lines = content.split('\n');
        lines.forEach(function (line) {
            if (line.trim() === '') {
                y += lineHeight / 2;
                return;
            }

            var parts = line.split(': ');
            if (parts.length > 1) {
                var label = parts[0] + ': ';
                var value = parts.slice(1).join(': ');

                doc.setFont('helvetica', 'bold');
                doc.text(label, x, y);
                var labelWidth = doc.getTextWidth(label);
                doc.setFont('helvetica', 'normal');
                doc.text(value, x + labelWidth, y);
            } else {
                doc.setFont('helvetica', 'normal');
                doc.text(line, x, y);
            }

            y += lineHeight;
        });
    }
});
