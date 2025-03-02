# app.py
# Flask 애플리케이션을 생성하고, Artsy API와 통신하는 엔드포인트들을 구현합니다.

from flask import Flask, render_template, request, jsonify
import requests
import os

# Flask 앱 생성
app = Flask(__name__)

# Artsy API 자격증명: 실제 값으로 교체하거나 환경변수를 사용하세요.
ARTSY_CLIENT_ID = os.environ.get('ARTSY_CLIENT_ID', '53d4af22054c64c2ef04')
ARTSY_CLIENT_SECRET = os.environ.get('ARTSY_CLIENT_SECRET', '77994f24c40c83b607bc136443c50f77')

def get_artsy_token():
    """
    Artsy API 인증 토큰을 가져오는 함수.
    - POST 메서드로 client_id와 client_secret을 전송하여 토큰을 받아옵니다.
    - 성공하면 토큰 문자열을 반환하고, 실패 시 None을 반환합니다.
    """
    token_url = 'https://api.artsy.net/api/tokens/xapp_token'
    data = {
        'client_id': ARTSY_CLIENT_ID,
        'client_secret': ARTSY_CLIENT_SECRET
    }
    response = requests.post(token_url, data=data)
    print(response)
    if response.status_code == 201:
        token_json = response.json()
        # print token_json
        print(token_json)
        return token_json.get('token')
    else:
        return None

@app.route('/')
def index():
    """
    루트 엔드포인트: 기본 HTML 페이지(index.html)를 렌더링합니다.
    """
    return render_template('index.html')

@app.route('/search')
def search_artists():
    """
    /search 엔드포인트: AJAX 요청으로 받은 검색어를 이용해 Artsy API의 Search 엔드포인트를 호출합니다.
    - 검색어가 없으면 에러 메시지와 함께 400 상태 코드를 반환합니다.
    - Artsy API 토큰을 가져오지 못하면 500 에러를 반환합니다.
    - 성공 시 아티스트 목록(JSON 형식)을 반환합니다.
    """
    query = request.args.get('q', '')
    if not query:
        return jsonify({'error': 'Empty query'}), 400

    token = get_artsy_token()
    if not token:
        return jsonify({'error': 'Unable to retrieve Artsy token'}), 500

    search_url = 'https://api.artsy.net/api/search'
    headers = {'X-Xapp-Token': token}
    params = {
        'q': query,
        'size': 10,       # 최대 10개의 결과를 요청
        'type': 'artist'  # 아티스트 결과만 가져오기
    }
    response = requests.get(search_url, headers=headers, params=params)
    if response.status_code == 200:
        data = response.json()
        results = data.get('_embedded', {}).get('results', [])
        artists = []
        for result in results:
            # 아티스트의 ID는 _links > self > href 필드에서 마지막 슬래시 이후의 문자열로 추출
            artist_href = result.get('_links', {}).get('self', {}).get('href', '')
            artist_id = artist_href.split('/')[-1] if artist_href else ''
            artist = {
                'id': artist_id,
                'name': result.get('title', ''),  # 아티스트 이름은 title 필드 사용
                'thumbnail': result.get('_links', {}).get('thumbnail', {}).get('href', '')
            }
            artists.append(artist)
        return jsonify({'artists': artists})
    else:
        return jsonify({'error': 'Search request failed'}), response.status_code

@app.route('/artist')
def get_artist_details():
    """
    /artist 엔드포인트: 선택한 아티스트의 ID를 기반으로 Artsy API의 Artists 엔드포인트를 호출하여 상세 정보를 반환합니다.
    - artist id가 없으면 400 에러를 반환합니다.
    - Artsy API 토큰을 가져오지 못하면 500 에러를 반환합니다.
    - 성공 시 아티스트의 상세 정보(JSON 형식)를 반환합니다.
    """
    artist_id = request.args.get('id', '')
    if not artist_id:
        return jsonify({'error': 'Missing artist id'}), 400

    token = get_artsy_token()
    if not token:
        return jsonify({'error': 'Unable to retrieve Artsy token'}), 500

    artist_url = f'https://api.artsy.net/api/artists/{artist_id}'
    headers = {'X-Xapp-Token': token}
    response = requests.get(artist_url, headers=headers)
    if response.status_code == 200:
        data = response.json()
        artist_details = {
            'name': data.get('name', ''),
            'birthday': data.get('birthday', ''),
            'deathday': data.get('deathday', ''),
            'nationality': data.get('nationality', ''),
            'biography': data.get('biography', '')
        }
        return jsonify({'artist': artist_details})
    else:
        return jsonify({'error': 'Failed to fetch artist details'}), response.status_code

if __name__ == '__main__':
    # 디버그 모드에서 앱 실행 (개발 시에만 사용)
    app.run(debug=True)
