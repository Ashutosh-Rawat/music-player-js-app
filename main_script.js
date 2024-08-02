document.addEventListener('DOMContentLoaded', async () => {
    const songsList = await fetchSongs();
    // creating array for genres
    const genreList = new Set();
    genreList.add('all');
    songsList.forEach(song => {
        genreList.add(song.genre);
    });
    // --------------------------------------------- implementation
    // genre list
    genreList.forEach(genre => {
        const option = document.createElement('option');
        option.textContent = genre;
        option.value = genre;
        genreOptionsTag.appendChild(option);
    });
    // genre all is important to event listeners
    showSongs(songsList,'genre','all');
    // change event listner for every drop down menu option
    genreOptionsTag.addEventListener('change', () => {showSongs(songsList)});
    // changing the list further on searching
    searchSongInput.addEventListener('input', () => {
        const searchTerm = searchSongInput.value.toLowerCase();
        const filteredSongs = songsList.filter(song => song.name.toLowerCase().includes(searchTerm));
        showSongs(filteredSongs);
    })
    // displaying songs info using renderCurrentSong
    renderCurrentSong(songsList[0]);
    // console.log(songsDiv);
    // previous song next song event listeners
    prevBtn.addEventListener('click', () => {
        if (currentSong === 1) return;
        currentSong -= 1;
        const songObj = songsList.find(song => song.id === currentSong);
        renderCurrentSong(songObj);
        playMusic(songObj);
        checkBtnStatus(songsList.length);
        highlightCurrentSongById(songsList,currentSong);
    });
    nextBtn.addEventListener('click', () => {
        if (currentSong === songsList.length) return;
        currentSong += 1;
        const songObj = songsList.find(song => song.id === currentSong);
        renderCurrentSong(songObj);
        playMusic(songObj);
        checkBtnStatus(songsList.length);
        highlightCurrentSongById(songsList,currentSong);
    });    
    // create playlists -it will also have functionalies for eventlistners
    // having all creating,swapping and deleting playlists
    createPlaylistBtn.addEventListener('click', () => {
        if (playlistInput.value && !playlists.hasOwnProperty(playlistInput.value)) {
            createPlaylist(songsList);
        } else if (playlists.hasOwnProperty(playlistInput.value)) {
            alert('Already a playlist with the name');
        }
    });    

    // add to playlist functionalities
    addToPlaylistBtn.addEventListener('click', () => {
        if (Object.keys(playlists).length === 0) {
            alert('No playlist created...');
            return;
        }
        if (playlists[selectedPlaylist].includes(currentSong)) {
            alert('Song already in playlist');
            return;
        }
        playlists[selectedPlaylist].push(currentSong);
        renderPlaylistSong(songsList);
        addPlaylistSongListeners(songsList);
        highlightCurrentSongById(songsList, currentSong);
    });    
    // toggleTheme function to change theme colors
    themeChangeBtn.addEventListener('click', toggleTheme);
  });
  