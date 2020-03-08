[![License: GPL v2](https://img.shields.io/badge/License-GPL%20v2-blue.svg)](https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html)
[![Actions Status](https://github.com/raz0red/js7800/workflows/Build/badge.svg)](https://github.com/raz0red/js7800/actions)

# JS7800

Ported by raz0red

JS7800 is an enhanced JavaScript port of the ProSystem Atari 7800 emulator developed by Greg Stanton packaged as a JavaScript module.
Portions of the Pokey code were adapted from the MAME implementation.

An example usage of the JS7800 module can be found at the following location:

https://raz0red.github.io/js7800/

[![JS7800](https://github.com/raz0red/js7800/raw/master/screenshots/screenshot.png)](https://raz0red.github.io/js7800/)

## JavaScript Module

This particular repository contains the JS7800 JavaScript Module. A JavaScript Module is a self-contained reusable component that can be utilized as part of a larger application. The JS7800 module is distributed as a single JavaScript file that contains of all the required JavaScript code, CSS, and images required for the emulator to execute. 

Packaging the emulator as a JavaScript module allows the component to be easily embedded for different devices and form factors (web, mobile, tablet, etc.). Currently, a separate repository is being developed that will embed the module and provide many additional features such as settings dialogs, persistence between sessions, and the ability to save and restore states. This README will be updated to reflect the various other related repositories once they become available.

## Loading Cartridges (ROMs)

The method for loading cartridges will vary based on the application that is embedding the JS7800 module. However, it should always be possible to load a local ROM file by **"Dragging and Dropping"** it on top of the JS7800 component. 

