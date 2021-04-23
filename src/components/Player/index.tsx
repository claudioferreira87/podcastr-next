import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import styles from './styles.module.scss';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

import { usePlayer } from '../../contexts/PlayerContext';
import { convertDurationToTimeString } from '../../utils/convertDurationToTimeString';

export default function Player() {
	const audioRef = useRef<HTMLAudioElement>(null);
	const [progress, setProgress] = useState(0);

	const {
		episodeList,
		currentEpisodeIndex,
		isPlaying,
		togglePlay,
		setPlayingState,
		playNext,
		playPrevious,
		hasNext,
		hasPrevious,
		isLooping,
		toggleLoop,
		isShuffling,
		toggleShuffle,
		clearPlayerState,
	} = usePlayer();

	useEffect(() => {
		if (!audioRef.current) {
			return;
		}
		if (isPlaying) {
			audioRef.current.play();
			console.log(currentEpisode);
		} else {
			audioRef.current.pause();
		}
	}, [isPlaying]);

	function setupProgressListener() {
		audioRef.current.currentTime = 0;
		audioRef.current.addEventListener('timeupdate', () => {
			setProgress(audioRef.current.currentTime);
		});
	}

	function handleSeek(amount: number) {
		audioRef.current.currentTime = amount;
		setProgress(amount);
	}

	function handleEpisodeEnded() {
		if (hasNext) {
			playNext();
		} else {
			clearPlayerState();
		}
	}

	const currentEpisode = episodeList[currentEpisodeIndex];

	return (
		<div className={styles.playerContainer}>
			<header>
				<img src="/playing.svg" alt="Tocando agora" />
				<strong>Tocando agora</strong>
			</header>

			{currentEpisode ? (
				<div className={styles.currentEpisode}>
					<Image width={592} height={592} src={currentEpisode.thumbnail} objectFit="cover" />
					<strong>{currentEpisode.title}</strong>
					<span>{currentEpisode.members}</span>
				</div>
			) : (
				<div className={styles.emptyPlayer}>
					<strong>Selecione um podcast para ouvir</strong>
				</div>
			)}

			<footer className={!currentEpisode ? styles.empty : ''}>
				<div className={styles.progress}>
					<span>{convertDurationToTimeString(progress)}</span>
					<div className={styles.slider}>
						{currentEpisode ? (
							<Slider
								max={currentEpisode.duration}
								value={progress}
								onChange={handleSeek}
								trackStyle={{ backgroundColor: '#04d361' }}
								railStyle={{ backgroundColor: '#9f75ff' }}
								handleStyle={{ borderColor: '#04d361', borderWidth: 4 }}
							/>
						) : (
							<div className={styles.emptySlider} />
						)}
					</div>
					<span>{convertDurationToTimeString(currentEpisode?.duration ?? 0)}</span>
				</div>

				{currentEpisode && (
					<audio
						src={currentEpisode.url}
						ref={audioRef}
						autoPlay
						onEnded={handleEpisodeEnded}
						onPlay={() => setPlayingState(true)}
						onPause={() => setPlayingState(false)}
						loop={isLooping}
						onLoadedMetadata={setupProgressListener}
					/>
				)}

				<div className={styles.buttons}>
					<button
						type="button"
						disabled={!currentEpisode || episodeList.length === 1}
						onClick={toggleShuffle}
						className={isShuffling ? styles.isActive : ''}
					>
						<img src="/shuffle.svg" alt="Aleatorio" />
					</button>
					<button type="button" disabled={!currentEpisode || !hasPrevious} onClick={playPrevious}>
						<img src="/play-previous.svg" alt="Tocar anterior" />
					</button>
					<button type="button" className={styles.playButton} disabled={!currentEpisode} onClick={togglePlay}>
						{isPlaying ? <img src="/pause.svg" alt="Pause" /> : <img src="/play.svg" alt="Tocar" />}
					</button>
					<button type="button" disabled={!currentEpisode || !hasNext} onClick={playNext}>
						<img src="/play-next.svg" alt="Tocar Proxima" />
					</button>
					<button type="button" disabled={!currentEpisode} onClick={toggleLoop} className={isLooping ? styles.isActive : ''}>
						<img src="/repeat.svg" alt="Repetir" />
					</button>
				</div>
			</footer>
		</div>
	);
}
