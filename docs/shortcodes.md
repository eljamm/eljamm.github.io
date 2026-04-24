---
title: Shortcodes
---

Quartz supports custom shortcodes for embedding rich content.
Shortcodes use Hugo-style syntax:

```md
{{ shortcode(attr="value") }}
```

## img

Embed images with optional caption, sizing, and link wrapping.

```md
{{ img(src="/image.png", alt="Description", caption="My photo") }}
```

### Attributes

| Attribute | Description |
|-----------|-------------|
| `src` | Image URL (required) |
| `alt` | Alt text for accessibility |
| `caption` | Caption text displayed below image |
| `width` | CSS width (e.g., "100%", "500px") |
| `height` | CSS height |
| `link` | URL to wrap image in a link |

### Examples

Basic image:

```
{{ img(src="/image.png") }}
```

With caption:

```
{{ img(src="photo.jpg", caption="My photo") }}
```

With link (clickable image):

```
{{ img(src="thumb.png", link="/full-size.png") }}
```

Custom size:

```
{{ img(src="img.jpg", width="50%", height="200px") }}
```

## video

Embed videos with optional caption and playback controls.

```md
{{ video(src="/video.mp4", caption="My video") }}
```

### Attributes

| Attribute | Description |
|-----------|-------------|
| `src` | Video URL (required) |
| `width` | CSS width (e.g., "100%") |
| `height` | CSS height |
| `controls` | Show playback controls ("true" / "false") |
| `autoplay` | Autoplay on page load |
| `loop` | Loop video |
| `muted` | Mute audio (required for autoplay in most browsers) |
| `caption` | Caption text |
| `alt` | Caption track label for accessibility |

### Examples

Basic video:

```
{{ video(src="/video.mp4") }}
```

With caption:

```
{{ video(src="video.mp4", caption="My cool video") }}
```

Autoplay muted (common for hero videos):

```
{{ video(src="video.mp4", autoplay, muted) }}
```

Custom width:

```
{{ video(src="video.mp4", width="100%") }}
```

Local video file:

```
{{ video(src="/videos/intro.mp4") }}
```

## youtube

Embed YouTube videos with a lazy-loaded thumbnail preview.
The shortcode displays a static thumbnail image first, then loads the actual video player only when a user clicks play.
This improves page load performance significantly when embedding multiple videos.

```md
{{ youtube(id="dQw4w9WgXcQ", title="My Video") }}
```

### Attributes

| Attribute | Description |
|-----------|-------------|
| `id` | YouTube video ID (required) |
| `title` | Title displayed on the thumbnail |
| `playlist` | Playlist ID to play after video ends |
| `autoplay` | Autoplay video ("true" / "false") |
| `cookie` | Use cookies ("true" / "false") |
| `class` | Additional CSS class |

### Examples

Basic video:

```
{{ youtube(id="dQw4w9WgXcQ") }}
```

With title:

```
{{ youtube(id="dQw4w9WgXcQ", title="My Video") }}
```

With playlist:

```
{{ youtube(id="abc123", playlist="PLxyz...") }}
```
