/*jslint browser: true, undef: true *//*global Ext,SlateAdmin*/
Ext.define('SlateAdmin.controller.People', {
    extend: 'Ext.app.Controller',
    requires: [
        'Ext.MessageBox',
        'SlateAdmin.API'
    ],


    // controller config
    views: [
        'people.NavPanel',
        'people.Manager'
    ],

    stores: [
        'people.People',
        'people.Groups',
        'people.GroupsTree',
        'people.AccountLevels'
    ],

    routes: {
        'people': 'showPeople',
        'people/lookup/:person': {
            action: 'showPerson',
            conditions: {
                ':person': '[^/]+'
            }
        },
        'people/lookup/:person/:tab': {
            action: 'showPerson',
            conditions: {
                ':person': '[^/]+'
            }
        },
        'people/search/:query': {
            action: 'showResults',
            conditions: {
                ':query': '[^/]+'
            }
        },
        'people/search/:query/:person': {
            action: 'showResults',
            conditions: {
                ':query': '[^/]+',
                ':person': '[^/]+'
            }
        },
        'people/search/:query/:person/:tab': {
            action: 'showResults',
            conditions: {
                ':query': '[^/]+',
                ':person': '[^/]+',
                ':tab': '[^/]+'
            }
        }
    },

    refs: [{
        ref: 'navPanel',
        selector: 'people-navpanel',
        autoCreate: true,

        xtype: 'people-navpanel'
    },{
        ref: 'searchField',
        selector: 'people-navpanel searchfield'
    },{
        ref: 'advancedSearchForm',
        selector: 'people-navpanel people-advancedsearchform'
    },{
        ref: 'groupsTree',
        selector: 'people-navpanel #groups'
    },{
        ref: 'manager',
        selector: 'people-manager',
        autoCreate: true,

        xtype: 'people-manager'
    },{
        ref: 'grid',
        selector: 'people-grid'
    },{
        ref: 'exportResultsBtn',
        selector: 'people-grid #exportResultsBtn'
    },{
        ref: 'sendInvitationsBtn',
        selector: 'people-grid #sendInvitationsBtn'
    },{
        ref: 'selectionCountCmp',
        selector: 'people-grid #selectionCount'
    },{
        ref: 'exportColumnsMenu',
        selector: 'people-grid menu#csvExportColumns'
//    },{
//        ref: 'personMenu',
//        autoCreate: true,
//        selector: 'people-personmenu',
//        xtype: 'people-personmenu'
//    },{
//        ref: 'personHeader',
//        selector: 'people-manager #person-header'
//    },{
//        ref: 'peopleSearchField',
//        selector: 'people-navpanel textfield[inputType=search]'
//    },{
//        ref: 'personProfile',
//        selector: 'people-details-profile'
//    },{
//        ref: 'personCourses',
//        selector: 'people-details-courses'
//    },{
//        ref: 'personContacts',
//        selector: 'people-details-contacts'
//    },{
//        ref: 'personProgressNotes',
//        selector: 'people-details-progressnotes'
//    },{
//        ref: 'peopleSearchField',
//        selector: 'people-navpanel #peopleSearchField'
//    },{
//        ref: 'peopleSearchOptionsForm',
//        selector: 'people-navpanel #searchOptionsForm'
    }],


    // controller template methods
    init: function() {
        var me = this;

        me.control({
            'people-navpanel': {
                expand: me.onNavPanelExpand
            },
            'people-navpanel searchfield': {
                specialkey: me.onSearchSpecialKey,
                clear: me.onSearchClear
            },
            'people-navpanel people-advancedsearchform field': {
                specialkey: me.onAdvancedSearchFormSpecialKey
            },
            'people-navpanel button[action=search]': {
                click: me.onSearchClick
            },
            'people-navpanel #groups': {
                select: me.onGroupSelect
            },
            'people-grid': {
                select: { fn: me.onPersonSelect, buffer: 10 },
                deselect: { fn: me.onPersonDeselect, buffer: 10 }
            },
            'people-manager #detailTabs': {
                tabchange: me.onDetailTabChange
            },
            'people-grid button#exportResultsBtn menuitem[exportFormat]': {
                click: me.onExportFormatButtonClick
            },
            'people-grid menu#csvExportColumns': {
                beforeshow: me.onBeforeCsvExportColumnsMenuShow
            }
//            'people-grid #exportResultsBtn': {
//                click: me.onExportResultsClick
//            },
//            'people-grid #exportResultsBtn menu': {
//                afterrender: me.onExportMenuRendered,
//                exportfieldsrefill: me.onExportFieldsRefill
//            },
//            'people-grid #exportResultsBtn #exportTypeMenu menucheckitem': {
//                checkchange: me.onExportTypeChange
//            },
//            'people-grid #exportResultsBtn #exportFieldsMenu menucheckitem': {
//                checkchange: me.onExportFieldsChange
//            }
        });

        me.listen({
            store: {
                '#People': {
                    load: me.onStoreLoad
                }
            }
        });
    },

    buildNavPanel: function() {
        return this.getNavPanel();
    },


    // route handlers
    showPeople: function() {
        var me = this,
            groupsTreePanel = me.getGroupsTree(),
            _selectRootNode = function() {
                groupsTreePanel.getSelectionModel().select(0, false, true);
            };

        Ext.suspendLayouts();
        me.getNavPanel().expand();
        me.application.getController('Viewport').loadCard(me.getManager());
        Ext.resumeLayouts(true);

        if (groupsTreePanel.rendered) {
            _selectRootNode();
        } else {
            groupsTreePanel.on('render', _selectRootNode);
        }
    },

    showPerson: function(person, tab) {
        alert('Loading an individual person is not yet implemented');
        // TODO: implement loading a person without a search query
//        debugger;
    },

    showResults: function(query, person, tab) {
        var me = this,
            ExtHistory = Ext.util.History,
            store = me.getPeoplePeopleStore(),
            proxy = store.getProxy(),
            manager = me.getManager();

        ExtHistory.suspendState();
        Ext.suspendLayouts();

        // decode query string for processing
        query = ExtHistory.decodeRouteComponent(query);
        person = ExtHistory.decodeRouteComponent(person);

        // queue store to load
        proxy.abortLastRequest(true);
        proxy.setExtraParam('q', query);

        // sync search field and form
        me.getSearchField().setValue(query);
        me.syncAdvancedSearchForm();

        // activate manager
        me.getNavPanel().expand();
        me.application.getController('Viewport').loadCard(manager);

        // resume layouts and insert a small delay to allow layouts to flush before triggering store load so loading mask can size correctly
        Ext.resumeLayouts(true);
        Ext.defer(function() {
            Ext.suspendLayouts();

            // execute search (suppressed by doSearch if query hasn't changed) and select user
            me.doSearch(false, function() {
                // activate tab
                if (person && tab) {
                    manager.detailTabs.setActiveTab(tab);
                }

                me.selectPerson(person, function() {
                    ExtHistory.resumeState();
                    Ext.resumeLayouts(true);
                });
            });
        }, 10);
    },


    // event handlers
    onNavPanelExpand: function(navPanel, isExpanding) {
        this.syncState();
    },

    onSearchSpecialKey: function(field, ev) {
        var query = field.getValue().trim();

        if (ev.getKey() == ev.ENTER) {
            if (query) {
                Ext.util.History.add(['people', 'search', query]);
            } else {
                this.getAdvancedSearchForm().getForm().reset();
            }
        }
    },

    onSearchClear: function(field, ev) {
        this.getAdvancedSearchForm().getForm().reset();
        this.getGroupsTree().getSelectionModel().select(0, false, true);
    },

    onAdvancedSearchFormSpecialKey: function(field, ev) {
        if (ev.getKey() == ev.ENTER) {
            this.syncQueryField(true);
        }
    },

    onSearchClick: function() {
        this.syncQueryField(true);
    },

    onGroupSelect: function() {
        this.syncQueryField(true);
    },

    onStoreLoad: function() {
        this.syncGridStatus();
    },

    onPersonSelect: function(selModel, personRecord, index) {
        var me = this,
            selectionCount = selModel.getCount();

        Ext.suspendLayouts();
        me.syncGridStatus();

        if (selectionCount == 1) {
            me.getManager().setSelectedPerson(personRecord);
            me.syncState();
        }

        Ext.resumeLayouts(true);
    },

    onPersonDeselect: function(selModel, personRecord, index) {
        var me = this,
            firstRecord;

        Ext.suspendLayouts();
        me.syncGridStatus();

        if (selModel.getCount() == 1) {
            firstRecord = selModel.getSelection()[0];
            me.onPersonSelect(selModel, firstRecord, firstRecord.index);
        }

        Ext.resumeLayouts(true);
    },

    onDetailTabChange: function(detailTabs, activeTab) {
        this.syncState();
    },

    onExportFormatButtonClick: function(menuItem) {
        var me = this,
            selectedRows = me.getGrid().getSelectionModel().getSelection(),
            exportColumnsMenu = me.getExportColumnsMenu(),
            exportFormat = menuItem.exportFormat,
            params = Ext.applyIf({
                format: exportFormat
            }, me.getPeoplePeopleStore().getProxy().extraParams),
            url;

        if (exportFormat == 'json') {
            params.include = '*';
        } else if (exportFormat == 'csv') {
            params.columns = Ext.Array.pluck(exportColumnsMenu.query('menuitem[checked]'), 'itemId').join(',');
        }
        
        if (selectedRows.length >= 1) {
            params.q = (params.q ? (params.q + ' ') : '') + ('id:' + selectedRows.map(function(row) {return row.data.ID;}).join(','));
        }

        url = '/people?' + Ext.Object.toQueryString(params);

        if (exportFormat == 'json') {
            window.open(url, '_blank');
        } else {
            location.href = url;
        }
    },

    onBeforeCsvExportColumnsMenuShow: function(menu) {
        var me = this,
            columnsPlaceholder = menu.down('#columnsPlaceholder'),
            selectedFieldKeys = ['FirstName', 'LastName', 'Username', 'StudentNumber', 'GraduationYear', 'Advisor', 'PrimaryEmail'];

        if (menu.loaded) {
            return;
        }

        menu.loaded = true;

        columnsPlaceholder.show();

        SlateAdmin.API.request({
            method: 'GET',
            url: '/people/*fields',
            success: function(response) {
                var recordData = response.data,
                    fields = recordData.fields,
                    dynamicFields = recordData.dynamicFields,
                    menuItems = [],
                    key, keyBits;

                for (key in fields) {
                    if (!fields.hasOwnProperty(key)) {
                        continue;
                    }

                    if (key == 'RevisionID') {
                        continue;
                    }

                    keyBits = key.match(/(\w+)ID(s?)/);
                    if (keyBits && dynamicFields.hasOwnProperty(keyBits[1]+keyBits[2])) {
                        continue;
                    }

                    menuItems.push({
                        xtype: 'menucheckitem',
                        itemId: key,
                        text: fields[key].label,
                        checked: Ext.Array.contains(selectedFieldKeys, key),
                        fieldType: 'field'
                    });
                }

                for (key in dynamicFields) {
                    if (!dynamicFields.hasOwnProperty(key)) {
                        continue;
                    }

                    menuItems.push({
                        xtype: 'menucheckitem',
                        itemId: key,
                        text: dynamicFields[key].label,
                        checked: Ext.Array.contains(selectedFieldKeys, key),
                        fieldType: 'dynamicField'
                    });
                }

                Ext.suspendLayouts();
                menu.insert(menu.items.indexOf(columnsPlaceholder)+1, menuItems);
                columnsPlaceholder.hide();
                Ext.resumeLayouts(true);
            }
        });
    },

//    onExportMenuRendered: function(exportMenu) {
//        var grid = exportMenu.up('people-grid'),
//            exportItems = grid.getExportItems();
//
//        if(!exportItems) {
//            exportMenu.setLoading(true);
//
//            Ext.Ajax.request({
//                url: '/people/json/reportFields',
//                method: 'GET',
//                success: function(response) {
//                    var r = Ext.decode(response.responseText);
//                    grid.setExportItems(r.data);
//
//                    grid.fireEvent('exportfieldsloaded');
//
//                    exportMenu.setLoading(false);
//                }
//            });
//        }
//    },
//
//    onExportFieldsRefill: function(exportFields) {
//        var me = this,
//            grid = me.getPeopleGrid(),
//            exportMenu = me.getExportResultsBtn().menu;
//
//        if(grid.exportFieldsLoaded) {
//            grid.checkExportItems(exportFields);
//        } else {
//            grid.on('exportfieldsloaded', function() {
//                grid.checkExportItems(exportMenu.pendingCheckedFields);
//
//                exportMenu.pendingCheckedFields = false;
//            }, null, {single: true});
//        }
//    },
//
//    onExportTypeChange: function(field) {
//        field.up('menu').fireEvent('exportformatchange');
//    },
//
//    onExportFieldsChange: function(checkItem) {
//        checkItem.up('menu').fireEvent('exportformatchange');
//    },
//
//    onExportResultsClick: function(exportButton, evt) {
//        var checkItemsMenu = exportButton.menu,
//            grid = exportButton.up('people-grid'),
//            responseMode = checkItemsMenu.down('#exportTypeMenu menucheckitem[checked=true]').value,
//            exportItems = grid.getExportItems(),
//            checkedItems = checkItemsMenu.query('#exportFieldsMenu menucheckitem[checked=true]'),
//            loadedQuery = Ext.getStore('People').getProxy().extraParams,
//            queryParam = {
//                q: loadedQuery ? loadedQuery.q : ''
//            };
//
//            if(exportItems && checkedItems.length != exportItems.length) {
//                var exportFields = [];
//
//                for(var i=0; i<checkedItems.length; i++) {
//                    exportFields.push(checkedItems[i].value);
//                }
//                queryParam.exportFields = exportFields.join(',');
//            }
//
//            grid.setLoading('Exporting Students &hellip;');
//
//            Jarvus.util.CookieSniffer.downloadFile('/people/' + responseMode + '?' + Ext.Object.toQueryString(queryParam, true), function(){
//                grid.setLoading(false);
//            });
//    },


    // controller methods
    doSearch: function(forceReload, callback) {
        var me = this,
            store = me.getPeoplePeopleStore(),
            proxy = store.getProxy();

        if (forceReload || proxy.isExtraParamsDirty()) {
            proxy.abortLastRequest(true);
            me.getManager().setSelectedPerson(null);
            me.getGrid().getSelectionModel().clearSelections();
            store.removeAll();
            store.load({
                callback: callback,
                scope: me
            });
        } else {
            Ext.callback(callback, me);
        }
    },

    syncState: function() {
        var me = this,
            manager = me.getManager(),
            selModel = me.getGrid().getSelectionModel(),
            detailTabs = manager.detailTabs,
            personRecord = manager.getSelectedPerson(),
            extraParams = me.getPeoplePeopleStore().getProxy().extraParams,
            path = ['people'],
            title = 'People',
            activeTab = null;

        if (extraParams && extraParams.q) {
            path.push('search', extraParams.q);
            title = '&ldquo;' + extraParams.q + '&rdquo;';
        } else if(personRecord) {
            path.push('lookup');
        }

        if (personRecord) {
            if (personRecord.get('Username')) {
                path.push(personRecord.get('Username'));
            } else {
                path.push('?id='+personRecord.get('ID'));
            }

            title = personRecord.getFullName();

            activeTab = detailTabs.getActiveTab() || detailTabs.items.getAt(0);

            if (activeTab) {
                path.push(activeTab.getItemId());
                title = activeTab.title + ' &mdash; ' + title;
            }
        }

        Ext.util.History.pushState(path, title);
    },

    syncGridStatus: function() {
        var me = this,
            grid = me.getGrid(),
            selectionCountCmp = me.getSelectionCountCmp(),
            exportResultsBtn = me.getExportResultsBtn(),
            sendInvitationsBtn = me.getSendInvitationsBtn(),
            selectionCount = grid.getSelectionModel().getCount(),
            actionCount = selectionCount || grid.getStore().getTotalCount(),
            hideBulkEditBtns = selectionCount >= 2;

        Ext.suspendLayouts();

        // update footer labels/buttons
        if (selectionCount >= 1) {
            selectionCountCmp.setText(selectionCount + (selectionCount==1?' person':' people') + ' selected');
            selectionCountCmp.show();
        } else {
            selectionCountCmp.hide();
        }

        if (actionCount >= 1) {
            exportResultsBtn.setText(
                'Export ' +
                (actionCount > 1 ? actionCount + ' ' : ' ') +
                'Result' +
                (actionCount != 1 ? 's' : '')
            );
            exportResultsBtn.enable();

            sendInvitationsBtn.setText(
                'Send ' +
                (actionCount > 1 ? actionCount + ' ' : ' ') +
                'Login Invitation' +
                (actionCount != 1 ? 's' : '')
            );
            sendInvitationsBtn.enable();
        } else {
            exportResultsBtn.setText('Export Results');
            exportResultsBtn.disable();
            sendInvitationsBtn.setText('Send Login Invitations');
            sendInvitationsBtn.disable();
        }

        // disable any components marked bulkOnly unless multiple rows are selected
        Ext.each(grid.query('toolbar [bulkOnly]'), function(editBtn) {
            editBtn.setDisabled(!hideBulkEditBtns);
        });

        Ext.resumeLayouts(true);
    },

    /**
     * Updates the advanced search form from the query string field
     *
     * Inverse of {@link #method-syncQueryField}
     */
    syncAdvancedSearchForm: function() {
        var me = this,
            form = me.getAdvancedSearchForm().getForm(),
            fields = form.getFields().items,
            fieldsLen = fields.length, fieldIndex = 0, field, fieldName,
            groupsTreePanel = me.getGroupsTree(),
            rootGroupNode = me.getPeopleGroupsTreeStore().getRootNode(),
            query = me.getSearchField().getValue(),
            terms = query.split(/\s+/),
            termsLen = terms.length, termIndex = 0, term,
            values = {};

        // build map of keyed search terms
        for (; termIndex < termsLen; termIndex++) {
            term = terms[termIndex].split(/:/, 2);
            if (term.length == 2) {
                values[term[0]] = term[1];
            }
        }

        Ext.suspendLayouts();

        // sync advanced search fields from query term values
        for (; fieldIndex < fieldsLen; fieldIndex++) {
            field = fields[fieldIndex];
            fieldName = field.getName();

            if (fieldName in values) {
                field.setValue(values[fieldName]);
            } else {
                field.reset();
            }
        }

        // sync group selection
        if (values.group) {
            rootGroupNode.expand(false, function() {
                var groupNode = rootGroupNode.findChild('Handle', values.group, true);

                if (groupNode) {
                    groupsTreePanel.selectRecord(groupNode, false, true); // true to suppress select event because we're bringing the tree in-sync with an existing selection rather than making a new one
                }
            });
        } else {
            groupsTreePanel.selectRecord(rootGroupNode, false, true); // true to suppress select event because we're bringing the tree in-sync with an existing selection rather than making a new one
        }

        Ext.resumeLayouts(true);
    },

    /**
     * Updates the query string field from the advanced search form
     *
     * Inverse of {@link #method-syncAdvancedSearchForm}
     */
    syncQueryField: function(execute) {
        var me = this,
            searchField = me.getSearchField(),
            form = me.getAdvancedSearchForm().getForm(),
            selectedGroups = me.getGroupsTree().getSelectionModel().getSelection(),
            fields = form.getFields().items,
            fieldsLen = fields.length, fieldIndex = 0, field, fieldName, fieldValue,
            query = searchField.getValue(),
            terms = query.split(/\s+/),
            termsLen = terms.length, termIndex = 0, term, splitTerm,
            fieldNames = [],
            unmatchedTerms = [],
            queuedTerms = [];

        // build list of field names and queued terms from advanced search form
        for (; fieldIndex < fieldsLen; fieldIndex++) {
            field = fields[fieldIndex];
            fieldName = field.getName();
            fieldValue = field.getValue();

            fieldNames.push(fieldName);

            if (fieldValue) {
                queuedTerms.push(fieldName + ':' + (fieldValue.match(/\s+/) ? '"' + fieldValue + '"' : fieldValue));
            }
        }

        // add selected group
        fieldNames.push('group');
        if (selectedGroups.length > 0 && (fieldValue = selectedGroups[0].get('Handle'))) {
            queuedTerms.push('group:'+fieldValue);
        }

        // scan query for terms that don't match a field
        for (; termIndex < termsLen; termIndex++) {
            term = terms[termIndex];
            splitTerm = term.split(/:/, 2);
            if (splitTerm.length != 2 || !Ext.Array.contains(fieldNames, splitTerm[0])) {
                unmatchedTerms.push(term);
            }
        }

        // build a query string that combines the unmatched terms with field values
        query = Ext.String.trim(Ext.Array.merge(unmatchedTerms, queuedTerms).join(' '));
        searchField.setValue(query);

        if (execute) {
            Ext.util.History.add(query ? ['people', 'search', query] : 'people');
        }
    },

    /**
     * Selects a person (or clears selection) and updates grid+manager state without firing any select/deselect events
     */
    selectPerson: function(person, callback) {
        var me = this,
            manager = me.getManager(),
            grid = me.getGrid(),
            store = grid.getStore(),
            selModel = grid.getSelectionModel(),
            personRecord, queryParts, fieldName, fieldValue,
            _finishSelectPerson;

        _finishSelectPerson = function() {
            if (personRecord) {
                selModel.select(personRecord, false, true);
            } else {
                selModel.deselectAll(true);
            }

            manager.setSelectedPerson(personRecord || null);
            me.syncGridStatus();
            me.syncState();
            Ext.callback(callback, me);
        };

        if (!person) {
           _finishSelectPerson();
        } else if (Ext.isString(person) && person.charAt(0) != '?') {
            personRecord = store.findRecord('Username', person);

            if (personRecord) {
                _finishSelectPerson();
            } else {
                // TODO: check if query params impacts this?
                store.load({
                    url: '/people/'+person,
                    callback: function(records, operation, success) {
                        if (!success || !records.length) {
                            Ext.Msg.alert('Error', 'Could not find the group/person you requested');
                        } else {
                            personRecord = records[0];
                        }

                        _finishSelectPerson();
                    }
                });
            }
        } else if (Ext.isString(person)) {
            queryParts = person.substr(1).split('=',2);
            fieldName = queryParts[0];
            fieldValue = queryParts[1];

            if (fieldName == 'id') {
                personRecord = store.getById(parseInt(fieldValue, 10));

                if (personRecord) {
                    _finishSelectPerson();
                } else {
                    // TODO: check if query params impacts this?
                    store.load({
                        url: '/people/'+fieldValue,
                        callback: function(records, operation, success) {
                            if (!success || !records.length) {
                                Ext.Msg.alert('Error', 'Could not find the person you requested');
                            } else {
                                personRecord = records[0];
                            }

                            _finishSelectPerson();
                        }
                    });
                }
            } else {
                Ext.Msg.alert('Error', 'Unknown person field: '+fieldName);
                _finishSelectPerson();
            }
        } else {
            personRecord = person;
            _finishSelectPerson();
        }
    }
});