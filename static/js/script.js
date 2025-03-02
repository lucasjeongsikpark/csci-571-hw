// static/js/script.js

// DOM이 모두 로드되면 스크립트 실행
document.addEventListener("DOMContentLoaded", function () {
  // HTML 엘리먼트 참조 변수 선언
  const searchIcon = document.getElementById("search-icon");
  const clearIcon = document.getElementById("clear-icon");
  const searchInput = document.getElementById("search-input");
  const resultsDiv = document.getElementById("results");
  const artistDetailsDiv = document.getElementById("artist-details");
  const loadingDiv = document.getElementById("loading");

  // Initially hide the artist details div
  artistDetailsDiv.style.display = "none";

  let isFirstSearch = true;

  // 클리어 아이콘 클릭 시 입력창 내용 삭제
  clearIcon.addEventListener("click", () => {
    searchInput.value = "";
  });

  // 검색 아이콘 클릭 시 검색 함수 호출
  searchIcon.addEventListener("click", performSearch);

  // 엔터 키를 누르면 검색 함수 호출
  searchInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      performSearch();
    }
  });

  // 검색을 수행하는 함수
  async function performSearch() {
    const query = searchInput.value.trim();
    if (!query) {
      // 입력창이 비어있으면 경고 메시지 표시
      if (!searchInput.checkValidity()) {
        searchInput.reportValidity();
        return;
      }
      return;
    }
    // 새로운 검색 결과로 업데이트
    // resultsDiv.innerHTML = "";
    artistDetailsDiv.innerHTML = "";
    // 이전 검색 결과와 아티스트 상세 정보를 초기화
    if (isFirstSearch) {
      resultsDiv.innerHTML = "";
      showLoading();
    } else {
      showLoading();
    }

    // Hide artist details div when performing a new search
    artistDetailsDiv.style.display = "none";

    // 백엔드 /search 엔드포인트에 AJAX 요청
    fetch(`/search?q=${encodeURIComponent(query)}`)
      .then((response) => response.json())
      .then((data) => {
        hideLoading();
        // 에러 발생 시 에러 메시지 출력
        resultsDiv.innerHTML = "";
        if (data.error) {
          resultsDiv.innerHTML = `<p>${data.error}</p>`;
        } else if (data.artists.length === 0) {
          // 검색 결과가 없으면 'No results found.' 출력
          resultsDiv.innerHTML = `<p class="no-results">No results found.</p>`;
        } else {
          // 검색 결과를 화면에 표시
          displayResults(data.artists);
          isFirstSearch = false;
        }
      })
      .catch((error) => {
        hideLoading();
        resultsDiv.innerHTML = `<p>Error: ${error}</p>`;
      });
  }

  // 검색 결과(아티스트 카드)를 화면에 추가하는 함수
  function displayResults(artists) {
    artists.forEach((artist) => {
      // 카드 엘리먼트 생성
      const card = document.createElement("div");
      card.className = "artist-card";
      card.dataset.id = artist.id;

      // 아티스트 썸네일 이미지 생성
      const img = document.createElement("img");
      // 썸네일이 없거나 "missing_image"인 경우 Artsy 로고 이미지 사용
      if (artist.thumbnail && !artist.thumbnail.includes("missing_image")) {
        img.src = artist.thumbnail;
      } else {
        img.src = "/static/images/artsy_logo.svg";
      }
      card.appendChild(img);

      // 아티스트 이름을 표시하는 <p> 엘리먼트 생성
      const namePara = document.createElement("p");
      namePara.textContent = artist.name;
      card.appendChild(namePara);

      // 카드 클릭 시 해당 아티스트의 상세 정보를 요청하는 이벤트 리스너 추가
      card.addEventListener("click", function () {
        // 다른 카드들의 선택 상태 제거 후 현재 카드 선택 표시
        document
          .querySelectorAll(".artist-card")
          .forEach((c) => c.classList.remove("selected"));
        card.classList.add("selected");
        fetchArtistDetails(artist.id);
      });

      // 결과 영역에 카드 추가
      resultsDiv.appendChild(card);
    });
  }

  // 선택된 아티스트의 상세 정보를 가져오는 함수
  function fetchArtistDetails(artistId) {
    // 기존 상세 정보 초기화 및 로딩 애니메이션 표시
    artistDetailsDiv.innerHTML = "";
    showLoading();

    // Show artist details div when fetching details
    artistDetailsDiv.style.display = "block";

    // 백엔드 /artist 엔드포인트에 AJAX 요청
    fetch(`/artist?id=${encodeURIComponent(artistId)}`)
      .then((response) => response.json())
      .then((data) => {
        hideLoading();
        if (data.error) {
          artistDetailsDiv.innerHTML = `<p>${data.error}</p>`;
        } else {
          // 상세 정보를 화면에 표시
          displayArtistDetails(data.artist);
        }
      })
      .catch((error) => {
        hideLoading();
        artistDetailsDiv.innerHTML = `<p>Error: ${error}</p>`;
      });
  }

  // 아티스트 상세 정보를 화면에 표시하는 함수
  function displayArtistDetails(artist) {
    // 아티스트 이름, 생년월일/사망년도, 국적, 그리고 전기를 표시
    const detailsHtml = `
            <p class="artist-name">${artist.name} (${artist.birthday || ""} ${
      artist.deathday ? "- " + artist.deathday : "- "
    })</p>
            <p class="artist-nationality">${artist.nationality || ""}</p>
            <p>${artist.biography || ""}</p>
        `;
    artistDetailsDiv.innerHTML = detailsHtml;
  }

  // 로딩 애니메이션을 표시하는 함수
  function showLoading() {
    loadingDiv.classList.remove("hidden");
  }

  // 로딩 애니메이션을 숨기는 함수
  function hideLoading() {
    loadingDiv.classList.add("hidden");
  }
});
