[![License: GPL v2](https://img.shields.io/badge/License-GPL%20v2-blue.svg)](https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html)
[![Actions Status](https://github.com/raz0red/js7800/workflows/Build/badge.svg)](https://github.com/raz0red/js7800/actions)

# JS7800

Ported by raz0red

JS7800 is an enhanced JavaScript port of the ProSystem Atari 7800 emulator that was originally developed by Greg Stanton.

https://raz0red.github.io/js7800/

In order to operate correctly and smoothly (no lags, etc.), JS7800 requires an updated version of a modern browser (Chrome, Firefox, Safari) on a capably configured system.

[![JS7800](https://github.com/raz0red/js7800/raw/master/screenshots/screenshot.png)](https://raz0red.github.io/js7800/)

## Features

* Global high score tracking (for HSC compatible games)
* Customizable keyboard mappings
* Gamepad compatibility (with dual-analog support for Robotron-style games)
* Full screen support
* Multiple aspect ratios
* Ability to enable/disable video filters
* Drag and drop support for local files and remote file links
* Cartridge list support (see [JS7800 Wiki](https://github.com/raz0red/js7800/wiki/Cartridge%20Lists))
* Light gun support (via mouse)
* Expansion Module (XM) support
* Enhanced bank switching and cartridge detection

## Future consideration

* Mobile support (virtual buttons, proper screen sizing, etc.)
* Paddle controller support (via mouse)
* Updating the emulation core to integrate accuracy and compatibility improvements that are part of the incredible [A7800 emulator](http://7800.8bitdev.org/index.php/A7800_Emulator)
* Save/load state support
* Network-based multiplayer support
* Improved cartridge browser with detailed descriptions and screenshots

## Documentation

JS7800 includes integrated documentation via the "Help/Information" button located in the commands bar directly below the emulator screen.

For information on the ["cartridge list"](https://github.com/raz0red/js7800/wiki/Cartridge%20Lists) format,  [request parameters](https://github.com/raz0red/js7800/wiki/Request%20Parameters), and more, refer to the [JS7800 Wiki](https://github.com/raz0red/js7800/wiki).

## Change log

### 01/05/21 (0.0.4)
    - Added global high score support for "Popeye"
    - Added global high score support for the latest version of "Pac-Man Collection!"
    - Updated to the latest versions of "Dragon's Cache", "Dragon's Descent", "Popeye",
      "Spire of the Ancients", "E.X.O", and "Knight Guy: Castle Days" 

### 09/03/20 (0.0.3)
    - Added support for undocumented ASR and ANC opcodes (fixes graphical glitches with
      "Popeye 7800: Mini-game")
    - Added global high score support for the latest version of "Pac-Man XM"
    - Added "Popeye 7800: Mini-game" and "Knight Guy: Castle Days" to the default list of 
      in-development games
    - Updated to the latest versions of "Dragon's Cache", "Dragon's Descent", "GoSub", and
      "Spire of the Ancients"
    - Updating to the latest version of "Dragon's Descent" required the global high scores for
      this game to be reset (the latest version modified the way high scores were stored)

### 06/18/20 (0.0.2)
    - XM implementation has been updated to be consistent with the released hardware
    - Initial support for the Yamaha (YM2151) sound chip
    - Ability to disable vertical sync ("Advanced" tab of settings dialog)
    - Zanac and Side-Crawler's Dance Yamaha music demos added to default cartridge list
    - XM memory test added to default cartridge list
    - By default, high scores for games that are not supported by the Global High Score server 
      will be stored locally
    - Resolved defect where Global High Scores were not supported when local storage was disabled

### 05/26/20 (0.0.1)
    - Ability to select a color palette ("Cool", "Warm", and "Hot") in "Dark" and "Light" variations
    - "Fullscreen" scaling option (Integer vs. Fill)
    - "Global Leaderboard" page
    - Contextual launch of "Global Leaderboard" via controls bar

### 05/16/20 (0.0.0)
    - Initial release

