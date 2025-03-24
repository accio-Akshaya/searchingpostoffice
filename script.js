$(document).ready(() => {
    $.getJSON("https://ipinfo.io", function (response) {
        $('.ip').html(`${response.ip}`);
        $('#ip-Ads').html(`IP Address : ${response.ip}`);
        fetchUserIPInformation(response.postal); // Pass postal code to fetch post office data
    });
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;
                console.log("Latitude:", latitude);
                console.log("Longitude:", longitude);
                const mapUrl = `https://maps.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`;
                $('#mapIframe').attr('src', mapUrl);
            },
            error => {
                console.error("Geolocation error:", error);
            }
        );
    } else {
        console.error("Geolocation is not supported by this browser.");
    }
    $('#searchbox').on('input', function() {
        const searchText = $(this).val().trim().toLowerCase();
        filterPostOffices(searchText);
    });
});
function filterPostOffices(searchText) {
    $('#postOfficeList .col').each(function() {
        const postOfficeName = $(this).find('.name').text().toLowerCase();
        if (postOfficeName.includes(searchText)) {
            $(this).show();
        } else {
            $(this).hide();
        }
    });
}

function fetchUserIPInformation(postalCode) {
    fetch('https://api.ipify.org?format=json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const userIP = data.ip;

            return fetch(`https://ipapi.co/${userIP}/json/`);
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(ipData => {
            $('#lat').text(ipData.latitude);
            $('#long').text(ipData.longitude);
            $('#city').text(ipData.city);
            $('#region').text(ipData.region);
            $('#hostname').text(ipData.hostname);
            $('#org').text(ipData.org);
            $('#timeZone').text(ipData.timezone);
            $('#dateTime').text(new Date().toLocaleString());
            $('#pinCode').text(ipData.postal);
            $('#message').text(ipData.message);

            fetchPostOfficeData(ipData.postal);
        })
        .catch(error => {
            console.error('There was a problem with your fetch operation:', error);
        });
}

function fetchPostOfficeData(pincode) {
    fetch(`https://api.postalpincode.in/pincode/${pincode}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data && Array.isArray(data[0].PostOffice)) {
                displayPostOffices(data[0].PostOffice);
            } else {
                console.log('No post offices found for the given pincode.');
            }
        })
        .catch(error => {
            console.error('There was a problem with fetching post office data:', error);
        });
}

function displayPostOffices(postOffices) {
    const postOfficeList = $('#postOfficeList');
    let count = 0;
    let row = null;

    postOffices.forEach(postOffice => {
        if (count % 2 === 0) {
            row = $('<div class="row"></div>');
            postOfficeList.append(row);
        }
        const col = $(`<div class="col">
                            <p>Name: ${postOffice.Name}</p>
                            <p>Branch Type: ${postOffice.BranchType}</p>
                            <p>Delivery Status: ${postOffice.DeliveryStatus}</p>
                            <p>District: ${postOffice.District}</p>
                            <p>Division: ${postOffice.Division}</p>
                        </div>`);
        row.append(col);

        count++;
    });
}