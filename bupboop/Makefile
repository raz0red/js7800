EMCC = emcc
SOURCES = \
	coretone/channel.c \
	coretone/coretone.c \
	coretone/music.c \
	coretone/sample.c \
	BupChip.c

EMFLAGS = -s EXPORTED_FUNCTIONS="[ \
	'_bupchip_GetBupChipBuffer', \
	'_bupchip_SetMusicBufferValue', \
	'_bupchip_ProcessAudioCommand', \
	'_bupchip_Process', \
	'_bupchip_GetMusicBuffer', \
	'_bupchip_GetMusicSize', \
	'_bupchip_StateLoaded', \
	'_bupchip_GetFlags', \
	'_bupchip_SetFlags', \
	'_bupchip_GetVolumeValue', \
	'_bupchip_SetVolumeValue', \
	'_bupchip_GetCurrentSong', \
	'_bupchip_SetCurrentSong', \
	'_bupchip_Unpack']" 

build: $(SOURCES)
	$(EMCC) $(EMFLAGS) $(SOURCES) -o bupboop.js

