const ITEMS_PER_PAGE = 9;
var hotelData = [];
let currentPage = 1;
let currentSort = null;
let originalPrices = []; // Array untuk menyimpan OriginalPrice dari setiap hotel

// Function to fetch XML data
function fetchXMLData() {
    fetch('https://frontedproject.vercel.app/Response.xml')
    .then(response => { return response.text(); })
    .then(data => {
        const parser = new DOMParser().parseFromString(data, "text/xml");
        const HotelResults = parser.querySelectorAll("HotelResult");

        // Bersihkan data hotelData
        hotelData = [];

        // Loop melalui semua elemen HotelResult
        HotelResults.forEach(hotelResult => {
            const hotelInfo = hotelResult.querySelector("HotelInfo");
            const code = hotelInfo.querySelector('HotelCode').textContent;
            const name = hotelInfo.querySelector('HotelName').textContent;
            const pictureElement = hotelInfo.querySelector('HotelPicture');
            const picture = pictureElement ? pictureElement.textContent : 'DefaultURL';
            const description = hotelInfo.querySelector('HotelDescription').textContent;
            const latitude = hotelInfo.querySelector('Latitude').textContent;
            const longitude = hotelInfo.querySelector('Longitude').textContent;
            const address = hotelInfo.querySelector('HotelAddress').textContent;
            const rating = hotelInfo.querySelector('Rating').textContent;

            // Mengidentifikasi elemen harga asli yang sesuai dengan elemen HotelInfo
            const originalPriceElement = hotelResult.querySelector("MinHotelPrice");
            const originalPrice = originalPriceElement ? originalPriceElement.getAttribute("OriginalPrice") : 'Unknown Price';
            
            const currencyElement = hotelResult.querySelector("MinHotelPrice");
            const currency = currencyElement ? currencyElement.getAttribute("Currency") : 'Unknown Price';
            // Menambahkan setiap hotel beserta harga asli ke dalam hotelData
            hotelData.push({
                HotelCode: code,
                HotelName: name,
                HotelPicture: picture,
                HotelDescription: description,
                Latitude: latitude,
                Longitude: longitude,
                HotelAddress: address,
                Rating: rating,
                Price: originalPrice,
                Currency: currency
            });
        });

        // Display the initial list of hotels
        displayHotelsInTable(hotelData, currentPage);
    })
    .catch(error => {
        console.error('Error fetching XML data:', error);
    });
}

// Call the fetchXMLData function to load data when the page loads
fetchXMLData();

// Function to display a list of hotels in a table
function displayHotelsInTable(hotels, page) {
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const paginatedHotels = hotels.slice(start, end);

    const hotelTableBody = document.querySelector('#hotelTable tbody');
    hotelTableBody.innerHTML = '';

    paginatedHotels.forEach((hotel) => {
        const hotelRow = createHotelTableRow(hotel);
        hotelTableBody.appendChild(hotelRow);
    });

    updatePagination(hotels.length, page);
}

function convertRatingTextToValue(ratingText) {
    switch (ratingText) {
      case "OneStar":
        return 1;
      case "TwoStar":
        return 2;
      case "ThreeStar":
        return 3;
      case "FourStar":
        return 4;
      case "FiveStar":
        return 5;
      default:
        return 0; // Nilai default jika tidak ada yang cocok
    }
  }
  function getRatingStarsHTML(ratingValue) {
    // Buat variabel untuk menyimpan HTML ikon bintang
    let starsHTML = '';

    // Loop melalui nilai rating dan tambahkan ikon bintang yang sesuai
    for (let i = 1; i <= 5; i++) {
        if (i <= ratingValue) {
            // Ikon bintang penuh jika nilai rating lebih besar dari atau sama dengan i
            starsHTML += '<i class="fas fa-star text-warning"></i>';
        } else {
            // Ikon bintang kosong jika nilai rating kurang dari i
            starsHTML += '<i class="far fa-star"></i>';
        }
    }

    // Kembalikan HTML ikon bintang
    return starsHTML;
}

// Function to create a table row for a hotel
function createHotelTableRow(hotel) {
    const row = document.createElement("tr");

    const mergedColumn = document.createElement("td");
    mergedColumn.colSpan = 5; // Setel jumlah kolom yang digabungkan sesuai dengan jumlah kolom dalam tabel
    mergedColumn.className = "merged-column";

    // Menggabungkan data ke dalam satu kolom dengan HTML yang sesuai
    const ratingValue = convertRatingTextToValue(hotel.Rating); // Konversi nilai rating
    const ratingHTML = getRatingStarsHTML(ratingValue);
    mergedColumn.innerHTML = `
        <div class="hotel-info">
            <h4>${hotel.HotelName}</h4>
            <p>${hotel.HotelDescription}</p>
            <p><strong>Address:</strong> ${hotel.HotelAddress}</p>
            <p><strong>Rating:</strong> ${ratingHTML} (${ratingValue})</p>
            <p><strong>Price:</strong> ${hotel.Price} ${hotel.Currency}</p>
        </div>
    `;
    const imageCell = document.createElement('td');
    const image = document.createElement('img');
    image.src = hotel.HotelPicture;
    image.alt = hotel.HotelName;
    imageCell.appendChild(image);

    row.appendChild(imageCell);
    row.appendChild(mergedColumn);

    return row;
}


// Function to update pagination
function updatePagination(totalItems, currentPage) {
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    const pagination = document.getElementById("pagination");
    pagination.innerHTML = '';

    const itemsPerPage = 5; // Jumlah tombol halaman per grup
    const totalGroups = Math.ceil(totalPages / itemsPerPage);

    let groupNumber = Math.ceil(currentPage / itemsPerPage);
    let startPage = (groupNumber - 1) * itemsPerPage + 1;
    let endPage = Math.min(startPage + itemsPerPage - 1, totalPages);

    if (groupNumber > 1) {
        // Tampilkan tombol "Previous Group"
        const previousGroup = document.createElement("li");
        previousGroup.classList.add("page-item");
        const previousGroupLink = document.createElement("a");
        previousGroupLink.classList.add("page-link");
        previousGroupLink.href = "#";
        previousGroupLink.innerText = "Previous Group";
        previousGroupLink.addEventListener("click", function () {
            currentPage = startPage - 1;
            displayHotelsInTable(hotelData, currentPage);
        });
        previousGroup.appendChild(previousGroupLink);
        pagination.appendChild(previousGroup);
    }

    for (let i = startPage; i <= endPage; i++) {
        const li = document.createElement("li");
        li.classList.add("page-item");
        if (i === currentPage) {
            li.classList.add("active");
        }

        const button = document.createElement("a");
        button.classList.add("page-link");
        button.href = "#";
        button.innerText = i;

        button.addEventListener("click", function () {
            currentPage = i;
            displayHotelsInTable(hotelData, currentPage);
        });

        li.appendChild(button);
        pagination.appendChild(li);
    }

    if (groupNumber < totalGroups) {
        // Tampilkan tombol "Next Group"
        const nextGroup = document.createElement("li");
        nextGroup.classList.add("page-item");
        const nextGroupLink = document.createElement("a");
        nextGroupLink.classList.add("page-link");
        nextGroupLink.href = "#";
        nextGroupLink.innerText = "Next Group";
        nextGroupLink.addEventListener("click", function () {
            currentPage = endPage + 1;
            displayHotelsInTable(hotelData, currentPage);
        });
        nextGroup.appendChild(nextGroupLink);
        pagination.appendChild(nextGroup);
    }
}

// Display initial list of hotels
displayHotelsInTable(hotelData, currentPage);

// Event listener untuk input pencarian agar responsif
searchInput.addEventListener('input', function () {
    searchHotels();
});


function searchHotels() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedCriteria = searchCriteria.value;

    if (searchTerm.trim() === '') {
        // Jika kotak pencarian kosong, tampilkan semua data
        displayHotelsInTable(hotelData, 1);
    } else {
        let filteredHotels;

        // Cek apakah kata kunci pencarian adalah angka
        if (!isNaN(searchTerm)) {
            // Kata kunci pencarian adalah angka, maka kita akan mencocokkannya dengan rating
            const searchRating = parseInt(searchTerm, 10);
            filteredHotels = hotelData.filter((hotel) => {
                const ratingValue = convertRatingTextToValue(hotel.Rating); // Konversi nilai rating
                return ratingValue === searchRating;
            });
        } else {
            // Kata kunci pencarian bukan angka, lanjutkan pencarian seperti biasa
            filteredHotels = hotelData.filter((hotel) => {
                const fieldValue = hotel[selectedCriteria].toLowerCase();
                return fieldValue.includes(searchTerm);
            });
        }

        displayHotelsInTable(filteredHotels, 1); // Menampilkan hasil pencarian pada halaman 1
    }
    currentPage = 1; // Reset currentPage
}

// Event listener untuk mengatur fungsi sortHotels ketika pilihan diubah
document.querySelector('.dropdown-menu').addEventListener('click', function (e) {
    if (e.target && e.target.dataset.value) {
        sortHotels(e.target.dataset.value);
    }
});

// Function to sort hotels
function sortHotels(sortKey) {
    if (sortKey === currentSort) {
        hotelData.reverse();
    } else {
        currentSort = sortKey;
        if (sortKey === 'HotelName') {
            hotelData.sort((a, b) => a.HotelName.localeCompare(b.HotelName));
        } else if (sortKey === 'HotelNameDesc') {
            hotelData.sort((a, b) => b.HotelName.localeCompare(a.HotelName));
        } else if (sortKey === 'Rating') {
            hotelData.sort((a, b) => convertRatingTextToValue(a.Rating) - convertRatingTextToValue(b.Rating));
        } else if (sortKey === 'RatingDesc') {
            hotelData.sort((a, b) => convertRatingTextToValue(b.Rating) - convertRatingTextToValue(a.Rating));
        } else if (sortKey === 'PriceAsc') {
            hotelData.sort((a, b) => parseFloat(a.Price) - parseFloat(b.Price));
        } else if (sortKey === 'PriceDesc') {
            hotelData.sort((a, b) => parseFloat(b.Price) - parseFloat(a.Price));
        }
    }

    displayHotelsInTable(hotelData, currentPage);
}



// Display initial list of hotels
displayHotelsInTable(hotelData, currentPage);

// Call fetchXMLData() to load data when the page loads
fetchXMLData();
