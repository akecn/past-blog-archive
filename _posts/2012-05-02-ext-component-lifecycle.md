---
layout: post
title: ExtJS Component Lifecycle
category: extjs
published: false
---

============
component life cycle

Initialization:
    applyConfig
    register base event
    register to component manager
    invoke initComponent method
    initialized state manager
    initialized plugins
    render component

Rendering:
    fire beforeRender
    set container
    fire onRender
    ensure the component is 'unhidden'
    apply custom styles
    a simply notification by component
    fire afterRender event
    set component hide/disabled
    state-specific events are initialized

Destruction:
    fire beforeDestroy event
    call beforeDestroy method
    remove it's element and listener
    call template method: onDestroy
    unregister from component manager
    fire destroy event
    remove event listener on the component

============
