flyWeightTreeView
=================

An implementation of a YUI3 TreeView based on the FlyWeight pattern.

This version is __deprecated__ the one being maintained is the YUI Gallery version available here: http://yuilibrary.com/gallery/show/flyweight-tree and http://yuilibrary.com/gallery/show/fwt-treeview
The description that follows is still valid so, feel free to carry on reading.

Ok, the name might not be the best and my implementation of the pattern not accurate, but it works like this:

The data of the tree is held in a plain object without methods, attributes or events.  Usually it is the very same object as provided as its initial configuration, for example:
``` Javascript
[
	{
		label:'label 0',
		children: [
			{
				label: 'label 0-0',
				expanded: false,
				children: [
					{
						label: 'label 0-0-0'
					},
					{
						label: 'label 0-0-1'
					}
				]
			},
			{
				label: 'label 0-1'
			}
		]
	},
	{
		label: 'label 1'
	}

]
```
For safety reasons, the tree configuration is cloned into an internal private property so changes in one do not affect the other.  The internal copy is traversed and extra information added to each node, such as `parent` links to aid in navigation.  Over the lifetime of the application, the internal copy will be augmented with further information.

In order to simplify the explanation, I will refer to TreeView and TreeNode instances though the explanation applies as well to a component made of Menu and MenuItem objects or Form, FieldSet and InputField objects.   The TreeView is the manager, the TreeNode is the node-object instance.

The TreeNode contains all the functionality for each node.  While the internal configuration object has all the data for all nodes in the tree, it has no methods, attributes or events.  It is the TreeNode (the node-object instance) that has the behavior.
 
The TreeView (the manager object) has a pool of TreeNode objects.   If a node does not have a `type` property, they will be of the `defaultType` set in the manager (for TreeView that would be TreeNode).   TreeView contains separate pools for each type so an object of the appropriate class is always available. If a pool has no instances of a given type, a newly created one is returned instead.  For TreeView, the default type is TreeNode, but the `type` property might refer to a sub-class of TreeNode.

Creating a subclass of TreeNode is usually trivial (taken from the demo):
```JavaScript
var ArtistNode = Y.Base.create(
	'artist-node',
	Y.TreeNode,
	[],
	{},
	{
		TEMPLATE: '<li id="{id}" class="{cname_node}"><div class="yui3-treenode-toggle"><\/div><div class="yui3-treenode-content">' + 
		          '<a href="{url}">{label}<\/a><\/div><ul class="{cname_children}">{children}<\/ul><\/li>',
		ATTRS: {
			url: {},
			artistId: {}
		}
		
	}
);
```
You would normally add some attributes and modify the template to show them.  In this case, the node is meant to display a YQL query on an artists database. The url is added to the template but the artistId is not since it is meant as an internal reference to fetch the artists' recordings.  Some of the markup is required by TreeView or by the Flyweight manager to locate the elements it needs to handle.
Instances of TreeNode will be taken from the pool (or created if none available) whenever they are required.  For example, the `forEachChild` method lets you loop over the children of a node.  It will provide the callback with a node-object instance (a TreeNode for TreeView or an ArtistNode as shown above) for each of the nodes visited. Once the callback returns, `forEachChild` will take care of returning the instance to the pool.  The reason for returning it is that each node might be of a different type so it might not be able to reuse the very same node all along, however, this is a subject for optimization.
Likewise with an event listener.  When a DOM event is detected, TreeView will locate the internal node whose HTML was the actual target.  It will then fetch the appropriate TreeNode instance from the pool, call the event listener on that node and, when it returns it will put it back to the pool.
Methods `_poolFetch` and `_poolReturn` (along `_createNode` if required) handle the pool of node-object instances . All the built-in methods take care of returning to the pool all the TreeNode instances they fetch.  
However, should the developer need to retain a TreeNode instance, for example, to do an asynchronous operation, the `hold` method has to be called. The manager will not return to the pool an instance marked as held.  Remember that instances are constantly reused so if you don't mark it as held, the instance might be repositioned on some other node when the asynchronous operation returns.
To free a held instance, you must call the `release` method.  Once an instance is released, its reference must be considered invalid, just as if it had been destroyed (in fact, it will be returned to the pool and might be repositioned).  When the pool gets a request for an instance of a node that is held, it will return a reference to the same copy held instead of another one from the pool.  If everything goes right, there should never be two active node-object instances on the same internal node.

For example, in the render operation, TreeView calls the `_getHTML` method on the root node. The root node does not have a visual representation of its own, only of its children.   Thus, it loops through each of its children via `forEachChild` and calls the `_getHTML` method of each which repeat the process recursively. That HTML is produced by filling up the node template with the information on each node as returned by a call to `getAttrs`.  It is the TreeView that finally inserts the string with all the markup into the ContentBox.

Events are handled by delegation by TreeView. When an event is detected, TreeView locates the internal node that corresponds to the target, fetches a TreeNode (or the node-object instance according to the type), slides it on top of that internal node and fires a custom event on TreeNode.  
The events to listen to are listed in the protected `_domEvents` array and they are all listened by the private `_afterEvent` method which positions a node from the pool and fires a custom event of the same name on the node.
The event listener on TreeNode needs not be aware of all this.  By the time it responds to the event, the TreeNode has already been positioned on top of the corresponding internal configuration node and it doesn't need to do anything when it is done, the TreeNode instance will be returned to the pool by the manager when it returns from firing the event (unless explicitly held).

All attribute change events work normally, after all, to change an attribute you have to do it through a TreeNode instance which is already positioned over the internal node so it will listen to the attribute-change event it has just generated.
Of course, if an internal-node property is changed directly, no TreeNode will ever know so the developer should not do this. Always use the TreeNode instance.

With all nodes of the same type, the pool in the manager will contain no more elements than the depth of the tree, if all nodes are rendered and none has been retained (not returned).  Thus, the memory footprint is very low.

TreeNode has two type of attributes, those that are global, such as `'root'` and those that are dependent on the internal configuration object.  The developer of subclasses of the node-object classes such as TreeNode should be careful to handle them differently.  The regular attributes will not change when TreeNode is slid on top of a node.  Node-dependent attributes need to know where to find their values. TreeView takes care of both types of attributes.  It is up to the developer to tell it which is which.  To do that, regular not node-dependent attributes should have the `_bypassProxy` property set to true.  
For node-dependent attributes, the `valueFn` attribute setting does not work.  Since the value function is evaluated when the instance is created, only the first time the instance is fetched from the pool.  The rest of the nodes using that same instance will receive the same value as the first time it was used, not its own new value.

---------------------------
The original proposal is described in these posts:

http://yuilibrary.com/forum/viewtopic.php?p=33740#p33740

http://yuilibrary.com/forum/viewtopic.php?p=33743#p33743

---------------------------
This demo also contains a sample on how to use this same mechanism to create a form, form fields and group of fields

------------------------------
The demo is self-contained except for the YUI files that it downloads from the CDN and the YQL data.  You just need to browse the index.html file to see it working.

The demo shows dynamic loading of nodes (via YQL) and how to defined various node types, all subclasses of TreeNode.

It can be seen running here:

http://satyam.com.ar/yui/3.0.0/flyWeightTreeView/

The demo in the link above uses the Gallery version of TreeView for the tree but the deprecated version for the form.

And the API docs for the version in the Gallery (along all the rest of my modules) here:

http://satyam.github.com/apiDocsGallery/

(the API docs for this deprecated version are at:  http://satyam.com.ar/yui/3.0.0/flyWeightTreeView/out)