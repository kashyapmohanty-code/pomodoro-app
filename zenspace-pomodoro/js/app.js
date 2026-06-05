/**
 * Master Architecture Controller Loop Object Setup Script Block Interface Hook
 */
document.addEventListener("DOMContentLoaded", () => {
    
    // Core Elements Declarations Maps
    const displayEl = document.getElementById('timer-display');
    const canvasEl = document.getElementById('graphic-canvas');
    
    const btnStart = document.getElementById('btn-start');
    const btnReset = document.getElementById('btn-reset');
    const btnSkip = document.getElementById('btn-skip');
    
    const modePomo = document.getElementById('mode-pomo');
    const modeBreak = document.getElementById('mode-break');
    
    const inputPomoTime = document.getElementById('input-pomo-time');
    const inputBreakTime = document.getElementById('input-break-time');
    const themeSelector = document.getElementById('theme-selector');
    
    const taskForm = document.getElementById('task-form');
    const taskInput = document.getElementById('task-input');
    const tasksContainer = document.getElementById('tasks-container');
    const taskCountEl = document.getElementById('task-count');

    // Upgraded Premium Media Player Component Map
    const btnAmbientToggle = document.getElementById('btn-ambient-toggle');
    const btnMediaPrev = document.getElementById('btn-media-prev');
    const btnMediaNext = document.getElementById('btn-media-next');
    const ambientVolSlider = document.getElementById('ambient-volume');
    const audioFileUploader = document.getElementById('audio-file-uploader');
    const audioTrackTitle = document.getElementById('audio-track-title');
    const audioStatusTag = document.getElementById('audio-status-tag');
    const trackIndexCounter = document.getElementById('track-index-counter');
    const playlistQueueContainer = document.getElementById('playlist-queue-container');
    const audioTimelineScrubber = document.getElementById('audio-timeline-scrubber');
    const audioTimeCurrent = document.getElementById('audio-time-current');
    const audioTimeTotal = document.getElementById('audio-time-total');
    const audioPlayer = document.getElementById('audio-player');

    // State Matrices Tracking Loops
    let tasks = typeof StorageController !== 'undefined' ? StorageController.loadTasks() : [];
    let isTimerRunning = false;
    
    // Playlist Context Memory Queues
    let playlistFiles = [];
    let currentTrackIndex = 0;
    let isAudioPlaying = false;

    // Initialize Timer Class Module Instance Core
    const timerEngine = new VisualTimerEngine(displayEl, canvasEl, () => {
        handleTimerStateReset();
        // Trigger a native notification banner alert overlay on completion
        setTimeout(() => {
            alert(timerEngine.currentMode === 'pomo' ? "🍅 Focus block complete! Time to take a well-deserved break." : "🌱 Break finished! Ready to lock back into focus?");
        }, 100);
    });

    timerEngine.updateDurations(parseInt(inputPomoTime.value), parseInt(inputBreakTime.value));
    timerEngine.updateUI();
    renderTasksView();

    // --- BATCH LOCAL DIRECTORY PLAYLIST MEDIA PIPELINE ---
    audioFileUploader.addEventListener('change', (event) => {
        const selectedFiles = Array.from(event.target.files);
        
        // Filter out non-audio files safely
        playlistFiles = selectedFiles.filter(file => file.type.startsWith('audio/'));

        if (playlistFiles.length > 0) {
            currentTrackIndex = 0;
            loadTrackByIndex(currentTrackIndex, false); // Link the file data stack ready
            renderPlaylistQueueView();
        } else {
            audioStatusTag.textContent = "No valid audio tracks found.";
        }
    });

    function loadTrackByIndex(index, shouldAutoPlay = true) {
        if (index < 0 || index >= playlistFiles.length) return;

        // Revoke active stream connection links cleanly to manage process footprint memory
        if (audioPlayer.src) {
            URL.revokeObjectURL(audioPlayer.src);
        }

        const targetFile = playlistFiles[index];
        const streamBlobUrl = URL.createObjectURL(targetFile);
        
        audioPlayer.src = streamBlobUrl;
        audioPlayer.load();

        // Update Track Meta Details
        audioTrackTitle.textContent = targetFile.name;
        audioStatusTag.textContent = "Buffered successfully.";
        trackIndexCounter.textContent = `${index + 1} / ${playlistFiles.length}`;

        resetTimelineUI();
        renderPlaylistQueueView(); // Dynamic re-render to capture state

        if (shouldAutoPlay) {
            playMediaStream();
        } else {
            pauseMediaStream();
        }
    }

    // --- DECOUPLED MEDIA ACTION EMITTERS (REPAIRED SEAMLESS PAUSE STATE) ---
    function playMediaStream() {
        if (!audioPlayer.src || audioPlayer.src === "") return;
        
        audioPlayer.play()
            .then(() => {
                isAudioPlaying = true;
                btnAmbientToggle.innerHTML = `<i class="fa-solid fa-pause text-xs"></i>`;
                audioStatusTag.textContent = "Streaming live audio path.";
            })
            .catch(err => {
                console.log("Authorization gesture hold active:", err);
                audioStatusTag.textContent = "Click play button to unlock sound.";
            });
    }

    function pauseMediaStream() {
        audioPlayer.pause();
        isAudioPlaying = true; // Set playing flag down smoothly
        isAudioPlaying = false;
        btnAmbientToggle.innerHTML = `<i class="fa-solid fa-play text-xs pl-0.5"></i>`;
        audioStatusTag.textContent = "Audio stream paused.";
    }

    btnAmbientToggle.addEventListener('click', () => {
        // Check if an audio path source is loaded into the element directly
        if (!audioPlayer.src || audioPlayer.src === "" || audioPlayer.src === window.location.href) {
            audioStatusTag.textContent = "Error: Queue files/folders first.";
            alert("Please pick a folder or choose audio files from your computer to construct a playlist queue first!");
            return;
        }
        
        if (isAudioPlaying) {
            pauseMediaStream();
        } else {
            playMediaStream();
        }
    });

    btnMediaNext.addEventListener('click', () => {
        if (playlistFiles.length === 0) return;
        currentTrackIndex = (currentTrackIndex + 1) % playlistFiles.length;
        loadTrackByIndex(currentTrackIndex, true);
    });

    btnMediaPrev.addEventListener('click', () => {
        if (playlistFiles.length === 0) return;
        currentTrackIndex = (currentTrackIndex - 1 + playlistFiles.length) % playlistFiles.length;
        loadTrackByIndex(currentTrackIndex, true);
    });

    // Auto-advance timeline queue mechanism block
    audioPlayer.addEventListener('ended', () => {
        if (playlistFiles.length === 0) return;
        currentTrackIndex = (currentTrackIndex + 1) % playlistFiles.length;
        loadTrackByIndex(currentTrackIndex, true);
    });

    // Native tracking volume slider listener configuration
    ambientVolSlider.addEventListener('input', (e) => {
        audioPlayer.volume = e.target.value;
    });

    // --- TIMELINE TRACK TRACKING & SCRUBBER ACTIONS ---
    audioPlayer.addEventListener('timeupdate', () => {
        if (isNaN(audioPlayer.duration)) return;
        
        const progressPercentage = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        audioTimelineScrubber.value = progressPercentage;
        
        audioTimeCurrent.textContent = formatTimeClockFormat(audioPlayer.currentTime);
        audioTimeTotal.textContent = formatTimeClockFormat(audioPlayer.duration);
    });

    audioTimelineScrubber.addEventListener('input', (e) => {
        if (!audioPlayer.src || isNaN(audioPlayer.duration)) return;
        const targetTimeTime = (e.target.value / 100) * audioPlayer.duration;
        audioPlayer.currentTime = targetTimeTime;
    });

    function resetTimelineUI() {
        audioTimelineScrubber.value = 0;
        audioTimeCurrent.textContent = "00:00";
        audioTimeTotal.textContent = "00:00";
    }

    function formatTimeClockFormat(seconds) {
        if (isNaN(seconds)) return "00:00";
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    }

    // --- VISUAL QUEUE UI HYDRATION LOOPS ---
    function renderPlaylistQueueView() {
        playlistQueueContainer.innerHTML = '';
        
        if (playlistFiles.length === 0) {
            playlistQueueContainer.innerHTML = `<p class="text-[10px] text-stone-600 italic text-center py-4">Your track queue is currently empty</p>`;
            return;
        }

        playlistFiles.forEach((file, idx) => {
            const trackRowNode = document.createElement('div');
            trackRowNode.id = `playlist-track-${idx}`;
            
            // Apply distinct highlighted properties conditionally depending on the active queue item index pointer
            if (idx === currentTrackIndex) {
                trackRowNode.className = "flex items-center gap-2 p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 text-[11px] truncate font-semibold";
                trackRowNode.innerHTML = `
                    <span class="font-mono text-[9px] text-emerald-500 w-4 text-right">${idx + 1}.</span>
                    <i class="fa-solid fa-compact-disc text-[9px] text-emerald-400 ${isAudioPlaying ? 'animate-spin' : ''}"></i>
                    <span class="truncate flex-1">${file.name}</span>
                `;
            } else {
                trackRowNode.className = "flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition text-[11px] text-stone-400 truncate";
                trackRowNode.innerHTML = `
                    <span class="font-mono text-[9px] text-stone-600 w-4 text-right">${idx + 1}.</span>
                    <i class="fa-solid fa-music text-[9px] text-stone-500"></i>
                    <span class="truncate flex-1 font-medium text-stone-300">${file.name}</span>
                `;
            }

            trackRowNode.addEventListener('click', () => {
                currentTrackIndex = idx;
                loadTrackByIndex(currentTrackIndex, true);
            });

            playlistQueueContainer.appendChild(trackRowNode);
        });
    }

    // --- REGULAR INTERFACE CONTROLS & LISTENERS ---
    inputPomoTime.addEventListener('change', () => {
        timerEngine.updateDurations(parseInt(inputPomoTime.value), parseInt(inputBreakTime.value));
    });

    inputBreakTime.addEventListener('change', () => {
        timerEngine.updateDurations(parseInt(inputPomoTime.value), parseInt(inputBreakTime.value));
    });

    themeSelector.addEventListener('change', (e) => {
        timerEngine.setTheme(e.target.value);
    });

    btnStart.addEventListener('click', () => {
        if (isTimerRunning) {
            timerEngine.stop();
            btnStart.textContent = "START FOCUS";
            btnStart.className = "bg-emerald-400 text-zinc-950 px-10 py-3.5 rounded-full font-bold shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all duration-200 tracking-wide text-sm";
        } else {
            timerEngine.start();
            btnStart.textContent = "PAUSE ENGINE";
            btnStart.className = "bg-amber-500 text-zinc-950 px-10 py-3.5 rounded-full font-bold shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all duration-200 tracking-wide text-sm";
        }
        isTimerRunning = !isTimerRunning;
    });

    btnReset.addEventListener('click', () => {
        timerEngine.reset();
        handleTimerStateReset();
    });

    btnSkip.addEventListener('click', () => {
        const target = timerEngine.currentMode === 'pomo' ? 'break' : 'pomo';
        switchTimerMode(target);
    });

    modePomo.addEventListener('click', () => switchTimerMode('pomo'));
    modeBreak.addEventListener('click', () => switchTimerMode('break'));

    function handleTimerStateReset() {
        isTimerRunning = false;
        btnStart.textContent = "START FOCUS";
        btnStart.className = "bg-emerald-400 text-zinc-950 px-10 py-3.5 rounded-full font-bold shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all duration-200 tracking-wide text-sm";
    }

    function switchTimerMode(modeKey) {
        timerEngine.setMode(modeKey);
        handleTimerStateReset();
        
        if (modeKey === 'pomo') {
            modePomo.className = "px-4 py-2 rounded-full bg-emerald-500 text-zinc-950 font-bold transition-all duration-300";
            modeBreak.className = "px-4 py-2 rounded-full text-stone-400 hover:text-stone-200 transition-all duration-300";
        } else {
            modeBreak.className = "px-4 py-2 rounded-full bg-emerald-500 text-zinc-950 font-bold transition-all duration-300";
            modePomo.className = "px-4 py-2 rounded-full text-stone-400 hover:text-stone-200 transition-all duration-300";
        }
    }

    // --- TASK CONTROLLER MANAGEMENT ENGINE ---
    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        tasks.push({ text: taskInput.value, completed: false });
        taskInput.value = '';
        syncTasksToStorage();
    });

    function syncTasksToStorage() {
        if (typeof StorageController !== 'undefined') StorageController.saveTasks(tasks);
        renderTasksView();
    }

    function renderTasksView() {
        tasksContainer.innerHTML = '';
        let matchCount = 0;

        tasks.forEach((task, idx) => {
            if (task.completed) matchCount++;

            const node = document.createElement('div');
            node.className = `flex items-center justify-between p-3 rounded-xl border border-white/5 transition duration-150 ${task.completed ? 'bg-zinc-900/40 opacity-40 line-through' : 'bg-white/5 hover:bg-white/10'}`;
            
            node.innerHTML = `
                <div class="flex items-center space-x-3 flex-1 cursor-pointer" id="task-node-${idx}">
                    <i class="fa-regular ${task.completed ? 'fa-circle-check text-emerald-400' : 'fa-circle text-stone-500'}"></i>
                    <span class="text-xs text-stone-200 tracking-wide font-normal">${task.text}</span>
                </div>
                <button id="task-del-${idx}" class="text-stone-600 hover:text-rose-400 transition ml-2">
                    <i class="fa-solid fa-trash-can text-xs"></i>
                </button>
            `;
            
            tasksContainer.appendChild(node);

            document.getElementById(`task-node-${idx}`).addEventListener('click', () => {
                tasks[idx].completed = !tasks[idx].completed;
                syncTasksToStorage();
            });

            document.getElementById(`task-del-${idx}`).addEventListener('click', (e) => {
                e.stopPropagation();
                tasks.splice(idx, 1);
                syncTasksToStorage();
            });
        });

        taskCountEl.textContent = `${matchCount}/${tasks.length} Completed`;
    }
});