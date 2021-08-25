const client_id = '9469cb661dbb45d185c8e76ae0ec7b45';
const redirect_uri = 'http://localhost:3000/';
const tokenRegEx = /access_token=([^&]*)/;
const expiresInRegEx = /expires_in=([^&]*)/;
let accessToken;
let expiresIn;

const Spotify = {

  getAccessToken() {
    if (accessToken) {
      return accessToken;
    } else if (window.location.href.match(tokenRegEx)) {
      accessToken = window.location.href.match(tokenRegEx)[1];
      expiresIn = window.location.href.match(expiresInRegEx)[1];
      //wiping out browser's history
      window.setTimeout(() => accessToken = '', expiresIn * 1000);
      window.history.pushState('Access Token', null, '/');

    } else {
      window.location = `https://accounts.spotify.com/authorize?client_id=${client_id}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirect_uri}`
    }
  },
  //https://accounts.spotify.com/authorize?client_id=9469cb661dbb45d185c8e76ae0ec7b45&response_type=token&scope=playlist-modify-public&redirect_uri=http://localhost:3000/

  async search(term) {
    const trackArr = [];
    const resp = await fetch(`https://api.spotify.com/v1/search?type=track&q=${term}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    const data = await resp.json();
    if (data.tracks.items.length === 0) return;

    data.tracks.items.map(item => {
      const track = {};
      track.id = item.id;
      track.name = item.name;
      track.artist = item.artists[0].name;
      track.album = item.album.name;
      track.uri = item.uri;
      trackArr.push(track);
    })
    return trackArr;
  },

  async savePlaylist(playlistName, trackURIarr) {
    let token = accessToken;
    const headers = {
      'Authorization': `Bearer ${token}`,
      //'Content-Type': 'application/json'
    }
    let userID;
    let playlistID;
    const playlistData = { name: playlistName };
    const tracksData = { uris: trackURIarr };

    const userResp = await fetch('https://api.spotify.com/v1/me', {
      headers: headers
    });
    const userJson = await userResp.json();
    userID = userJson.id;

    const playlistResp = await fetch(`https://api.spotify.com/v1/users/${userID}/playlists`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(playlistData)
    });
    const playlistJson = await playlistResp.json();
    console.log(playlistJson);
    playlistID = playlistJson.id

      fetch(`https://api.spotify.com/v1/playlists/${playlistID}/tracks`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(tracksData)
    })
  }

}

export default Spotify;
