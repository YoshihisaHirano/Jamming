import React from 'react';
import './App.css';
import SearchBar from '../SearchBar/SearchBar';
import SearchResults from '../SearchResults/SearchResults';
import Playlist from '../Playlist/Playlist';
import Spotify from '../../util/Spotify';

Spotify.getAccessToken();


class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { searchResults: [],
        playlistName: '',
        playlistTracks: []
  }

  this.addTrack = this.addTrack.bind(this);
  this.removeTrack = this.removeTrack.bind(this);
  this.updatePlaylistName = this.updatePlaylistName.bind(this);
  this.savePlaylist = this.savePlaylist.bind(this);
  this.search = this.search.bind(this);
  }

  addTrack(track) {
      if (this.state.playlistTracks.find(savedTrack => savedTrack.id === track.id)) {
        return;
      } else {
        const updatedPlaylist = this.state.playlistTracks.concat(track);
        this.setState({ playlistTracks: updatedPlaylist});
        const updatedResults = this.state.searchResults.filter(elt => elt.id !== track.id);
        this.setState({ searchResults: updatedResults });
      }
  }

  removeTrack(track) {
    const updatedPlaylist = this.state.playlistTracks.filter(elt => elt.id !== track.id);
    this.setState({ playlistTracks: updatedPlaylist })
  }

  updatePlaylistName(name) {
    this.setState({ playlistName: name });
  }

  async savePlaylist() {
    const trackURIs = [];
    this.state.playlistTracks.map(elt => trackURIs.push(elt.uri));
    await Spotify.savePlaylist(this.state.playlistName, trackURIs);
    this.setState({ playlistName: '' });
    this.setState({ playlistTracks: [] });
  }

  async search(term) {
    const result = await Spotify.search(term);
    console.log(result);
    const filteredResult = result.filter((track) => {
      if(this.state.playlistTracks.every(elt => elt.id !== track.id)) return track;
    })
    this.setState({ searchResults: filteredResult });
  }

  render() {
    return (
      <div>
    <h1>Ja<span className="highlight">mmm</span>ing</h1>
    <div className="App">
      <SearchBar onSearch={this.search}/>
      <div className="App-playlist">
        <SearchResults searchResults={this.state.searchResults} onAdd={this.addTrack}/>
        <Playlist playlistName={this.state.playlistName} playlistTracks={this.state.playlistTracks} onRemove={this.removeTrack}
        onNameChange={this.updatePlaylistName} onSave={this.savePlaylist} />
      </div>
    </div>
  </div>
    );
  }

}

export default App;
