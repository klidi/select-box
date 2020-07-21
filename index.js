
// code is a bit sloppy as i have not worked in 4 years in vanilla js and always try to avoid it by using ts.
// i thought of to main solutions , one was this and the other was grouping options inside selects in optGroups where
// each group would be identified by the parent id and then play with show() hide() optGroups
// If i had more hrs to spend and this would be a real case i would have refactored it and simplified and iterated through
// code a few more times. Also i choose to render elements using js but they could be defined also in a "macro" template
// have included also bootstrap.css cdn just to make it a bit prettier for the eyes
var selectBoxDataTree = [
	{
		"label": "A",
		"id": 1,
		"children": [
			{
				"label": "2",
				"id":4,
			},
			{
				"label": "4",
				"id":5,
			},
			{
				"label": "6",
				"id":6,
			}
		]
	},
	{
		"label": "B",
		"id": 2,
		"children": [
			{
				"label": "1",
				"id":7,
			},
			{
				"label": "3",
				"id":8,
			},
			{
				"label": "10",
				"id":9,
				"children": [
					{
						"label": "70",
						"id":13,
					},
					{
						"label": "PI",
						"id":14,
						"children": [
							{
								"label": "Test",
								"id":19,
							},
							{
								"label": "Foo",
								"id":20,
							},
							{
								"label": "Bar",
								"id":21,
							}
						]
					},
					{
						"label": "Segma",
						"id":15,
					}
				]
			}
		]
	},
	{
		"label": "C",
		"id": 3,
		"children": [
			{
				"label": "50",
				"id":10,
			},
			{
				"label": "60",
				"id":11,
				"children": [
					{
						"label": "Alpha",
						"id":16,
					},
					{
						"label": "3",
						"id":17,
					},
					{
						"label": "Zeta",
						"id":18,
					}
				]
			},
			{
				"label": "70",
				"id":12,
			}
		]
	}
]

/**
 * this const holds the key/property that wrapped child elements in the "selectBoxDataTree"
 * in a real world project , the tree might come from a 3rd party or from a BE where we cant control
 * the structure. You define this in your module , though here this is not structured in modules just for the ease of
 * running it quickly, and then you pass it when calling createOptionElements() from your module.
 * Similar to this we can define key/properties for selectBoxDataTree properties that we want to use like label etc
 * but here i gave only one example the all we need to make the script work is a structure:
 * {
 *   a: "",
 *   b: "",
 *   ...,
 *   z: [
 *      {
 *         a1: "",
 *         b1: "",
 *         ...
 *       }
 *   ]
 * }
 *
 */
const childrenKey = 'children';

document.addEventListener("DOMContentLoaded", function() {
	var optionElements = [];
    var firstSelection = true;

    /**
	 * this functions iterates the hole tree and groups all options by depth lvl
     * the same function is called if we want to generate options for portions of the tree
     *
     * @param selectBoxData
     * @param children
     * @param parentPath
     * @param currentLvl
     */
	function createOptionElements(selectBoxData, children, parentPath, currentLvl) {
		Object.entries(selectBoxData).forEach(entry => {
			[key, selectBox] = entry;
			if (!optionElements.hasOwnProperty("select_" + currentLvl)) {
                createDefaults(currentLvl);
     		}
     		const currentFragment = optionElements["select_" + currentLvl];
            let dataPath = parentPath + ',' + key;
            if (!parentPath) {
                currentLvl = 0;
                dataPath = key;
            }
			createOptions(selectBox, dataPath, currentFragment);
			if (selectBox.hasOwnProperty(children)) {
				createOptionElements(selectBox[children], childrenKey, dataPath, currentLvl + 1);
			}
		});
	}

    /**
	 *
     * @param formwrapper
     * @param path
     * @param isAboveSelectedElement
     */
	function appendOptions(formwrapper, path, isAboveSelectedElement) {
		Object.values(optionElements).forEach(optionElement => {
            if (path && isAboveSelectedElement) {
                let elementKey = parseInt(path) + 1;
                optionElement.children[0].removeAttribute("selected", '');
                // set selected elements in all affected selects
                optionElement.children[elementKey].setAttribute("selected", '');
            }
            let formGroup = createFromGroupAndSelect(optionElement, formwrapper);
		 	formwrapper.appendChild(formGroup);
		});
	}

    /**
	 *
     * @param currentLvl
     */
    function createDefaults(currentLvl) {
        optionElements["select_" + currentLvl] = document.createDocumentFragment();
        let defaultOption = document.createElement('option');
        defaultOption.appendChild(document.createTextNode("Select something"));
        defaultOption.setAttribute("disabled", '');
        defaultOption.setAttribute("selected", '');
        optionElements["select_" + currentLvl].appendChild(defaultOption);
    }

    /**
	 *
     * @param selectBox
     * @param dataPath
     * @param currentFragment
     */
    function createOptions(selectBox, dataPath, currentFragment) {
        const option = document.createElement('option');
        option.appendChild(document.createTextNode(selectBox.label));
        option.value = selectBox.label;
        // this attribute with help us to access elements by index in the tree, minimizing tree traversals and node searching
        // also help us select the parents when select directions in from child to parent
        option.setAttribute('data-path', dataPath);
        currentFragment.appendChild(option);
    }

    /**
	 *
     * @param optionElement
     * @param formwrapper
     * @returns {HTMLElement}
     */
    function createFromGroupAndSelect(optionElement, formwrapper) {
        const formGroup = document.createElement('div');
        formGroup.classList.add('form-group')
        formGroup.classList.add('col-12');
        const select = document.createElement('select');
        select.classList.add('form-control');
        select.appendChild(optionElement);
        // add on change event listener to select element
        select.addEventListener("change", function(e){
            e = e || event;
            handleSelect(e, selectBoxDataTree, formwrapper)
        });
        formGroup.appendChild(select);
        return formGroup;
    }

    /**
	 *
     * @param e
     * @param selectBoxData
     * @param formwrapper
     */
	function handleSelect(e, selectBoxData, formwrapper) {
        let siblings =  Array.prototype.slice.call(formwrapper.children);
        let elementIndex = siblings.indexOf(e.target.parentNode);
        let option = e.target.childNodes[e.target.selectedIndex];
        if (option.getAttribute("data-path")) {
            let path = option.getAttribute("data-path").split(',');
            let extractedData = extractTreeData(path, siblings, elementIndex, selectBoxData);
            reRenderElements(e, path, formwrapper, siblings, elementIndex, extractedData);
        }
	}

    /**
	 *
     * @param e
     * @param path
     * @param formwrapper
     * @param siblings
     * @param elementIndex
     * @param extractedData
     */
    function reRenderElements(e, path, formwrapper, siblings, elementIndex, extractedData) {
        removeElements(formwrapper, siblings, elementIndex);
        let dataLength = extractedData.length;
        if (dataLength > 0) {
            for (let i = 0; i < dataLength; ++i) {
                optionElements = {};
                if (i === 0) {
                    // here we tell the createOptionElements to render the first select which is the base/root of tree
                    // and not iterate through children
                    createOptionElements(extractedData[i].data, null, 0, 0);
                } else if (i > (elementIndex)) {
                    createOptionElements(extractedData[i].data, childrenKey, path, 0);
                } else {
                    createOptionElements(extractedData[i].data, null, extractedData[i].path, 0);
                }
                appendOptions(formwrapper, path[i], i <= elementIndex);
            }
        }
    }

    /**
     *
     * this is the magic behind re-rendering on change.
     * this will access elements on tree by index , which is fast,
     * there is no tree traversal involved nor node search
     * whatever is stored in extractedData[n]["data"] no matter how big or small has little to no memory costs as
     * everything is a pointer to selectBoxDataTree. This will set individual "data" for each select up to the select element that
     * is the onChange Element then all select elements after it will be populated from its children. The select elements that are above this
     * element that had the onchange event with be iterated only for the first level of depth in their "data" property.
	 *
     * @param path
     * @param siblings
     * @param elementIndex
     * @param selectBoxData
     * @returns {Array}
     */
    function extractTreeData(path, siblings, elementIndex, selectBoxData) {
        optionElements = {};
        let extractedData = [];
        if (path.length > 0) {
            extractedData.push({'data': selectBoxData, 'path': 0});
            let data = selectBoxData;
            let treePath = null;
            for (i = 0, len = path.length; i < len; i++) {
                let dataObject = {};
                if (!treePath) {
                    treePath = path[0];
                } else {
                    treePath += "," + path[i];
                }
                if (data[path[i]] && data[path[i]][childrenKey]) {
                    data = data[path[i]][childrenKey];
                    dataObject['data'] = data;
                    dataObject['path'] = treePath;
                    extractedData.push(dataObject);
                }
            }
        }
        return extractedData;
    }

    /**
	 * since we have to support the select box cascading from both
	 * direction (parent -> child , child -> parent)
     * removing all select elements and not just the options
     * makes maintenance easier.
     *
     * @param formwrapper
     * @param siblings
     * @param elementIndex
     */
	function removeElements(formwrapper, siblings, elementIndex) {
        formwrapper.querySelectorAll('.form-group').forEach(n => n.remove());
	}

	createOptionElements(selectBoxDataTree, childrenKey, 0, 0);
	appendOptions(document.querySelector("#form-wrapper"), null, null);
});