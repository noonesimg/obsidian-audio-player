# Obsidian Audio Player

- one audio instance for the whole obsidian vault
- easy to initialize
- wave visualizer 
- keeps playing even if you've closed the tab
- add bookmarks to your audio files

## Demo
![add_audio](https://user-images.githubusercontent.com/117757392/201384119-fa94f5bc-dc8f-4e03-8822-0f8948aa52dd.gif)

## How to use
~~~
```audio-player
[[my awesome audio file.mp3]]
```
~~~
just add this to any of your md files

### Two simple Commands
accessable through command menu (Ctrl-P)

1. **Pause Audio** to pause whatever audio is playing
2. **Resume Audio** to resume 

### Add bookmarks through ui
![add_bookmark](https://user-images.githubusercontent.com/117757392/201384274-14831e0b-458e-4a01-9869-34f34ad628cc.gif)

1. Double click on any of the bars on the wave visualizer, 
2. Type your text
3. Hit enter or press the "Add" button
4. Click on any bookmark timecode to set the playhead position

### Add bookmarks through text
~~~
```audio-player
[[my awesome audio file.mp3]]
00:00:44 --- chapter
00:01:50 --- chapter 2 
00:02:40 --- chapter 3 in which nothing happened
```
~~~
![image](https://user-images.githubusercontent.com/117757392/201384550-33aa7f25-cadc-4ce5-a846-24d87bd7a05d.png)


## How to install

### From Obsidian

1. Open Settings > Thrid-party plugin
2. Make sure Safe mode is off
3. Click Browse community plugins
4. Search Audio Player
5. Click install
6. Close community plugin browser and activate the plugin

### Using Git

1. Close obsidian
2. Go to your vault .obsidian/plugins folder in the terminal
3. git clone https://github.com/noonesimg/obsidian-audio-player.git
4. Open obsidian
5. Go to settings -> community plugins
6. Scroll down, find "Audio Player" plugin and enable it


## Pricing
The plugin is free, athough if you wanna say thanks, feel free to buy me a coffee

[<img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="BuyMeACoffee" width="100">](https://www.buymeacoffee.com/noonesimg)


## Notes 
If there're any bugs or instabilities, don't hesitate to open an issue 
