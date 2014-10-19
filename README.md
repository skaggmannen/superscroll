# superscroll

An angular module for creating scrolling containers for huge amount of data

## FAQ

#### The page hangs for a really log time when I try to use it. Whats up with that?
This is probably because you forgot to set a height constrain on the scrollable container. If you don't this container will be populated with the entire data set, since the dynamic chunks are calculated depending on the containers size constraits.
