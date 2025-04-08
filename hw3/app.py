# Creates the Flask application and implements endpoints that communicate with the Artsy API.
from flask import Flask, render_template, request, jsonify
import requests
import os
from dotenv import load_dotenv

# Create the Flask app
app = Flask(__name__)

load_dotenv()
ARTSY_CLIENT_ID = os.environ.get('ARTSY_CLIENT_ID')
ARTSY_CLIENT_SECRET = os.environ.get('ARTSY_CLIENT_SECRET')

def get_artsy_token():
    """
    Function to obtain the Artsy API authentication token.
    - Sends a POST request with client_id and client_secret to receive a token. cliend_id and client_secret is available in .env file. Tokens are valid for 7 days.
    - Returns the token string if successful, or None if it fails.
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
        # print(token_json)
        return token_json.get('token')
    else:
        return None

@app.route('/')
def index():
    """
    Root endpoint: Renders the main HTML page (index.html).
    """
    return render_template('index.html')

@app.route('/search')
def search_artists():
    """
    /search endpoint: Calls the Artsy API's Search endpoint using the search term received via an AJAX request.
    - 400 if the search query is empty. 500 if the Artsy API token cannot be retrieved.
    - Success. Return list of artists in JSON format.
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
        'size': 10, # Request up to 10 results
        'type': 'artist' # Retrieve only artist results
    }
    response = requests.get(search_url, headers=headers, params=params)
    if response.status_code == 200: # Success
        data = response.json()
        results = data.get('_embedded', {}).get('results', [])
        artists = [] # List to store artist information. Size of 10.
        for result in results:
            # Extract the artist's ID from the _links > self > href field, taking the string after the last slash.
            artist_href = result.get('_links', {}).get('self', {}).get('href', '')
            artist_id = artist_href.split('/')[-1] if artist_href else ''
            artist = {
                'id': artist_id, # will be used to fetch detailed information
                'name': result.get('title', ''),  # Use the title field for the artist's name
                'thumbnail': result.get('_links', {}).get('thumbnail', {}).get('href', '')
            }
            artists.append(artist)
        return jsonify({'artists': artists})
    else:
        return jsonify({'error': 'Search request failed'}), response.status_code

@app.route('/artist')
def get_artist_details():
    """
    /artist endpoint: Calls the Artsy API's Artists endpoint based on the selected artist's ID to return detailed information.
    - 400 if the artist id is missing. 500 if the Artsy API token cannot be retrieved.
    - Success. Return the artist's detailed information in JSON format.
    """
    artist_id = request.args.get('id', '')
    # print(artist_id)
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
    app.run(debug=True)
