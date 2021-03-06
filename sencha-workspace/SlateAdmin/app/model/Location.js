/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.model.Location', {
    extend: 'Ext.data.Model',
    requires: [
        'SlateAdmin.proxy.Records'
    ],


    // model config
    idProperty: 'ID',

    fields: [
        {
            name: "ID",
            type: "int",
            useNull: true
        },
        {
            name: "Class",
            type: "string",
            defaultValue: "Emergence\\Locations\\Location"
        },
        {
            name: "Created",
            type: "date",
            dateFormat: "timestamp",
            useNull: true
        },
        {
            name: "CreatorID",
            type: "int",
            useNull: true
        },
        {
            name: "RevisionID",
            type: "int",
            useNull: true
        },
        {
            name: "Title",
            type: "string"
        },
        {
            name: "Handle",
            type: "string"
        },
        {
            name: "Status",
            type: "string",
            defaultValue: "Live"
        },
        {
            name: "Description",
            type: "string",
            useNull: true
        },
        {
            name: "ParentID",
            type: "int",
            useNull: true
        },
        {
            name: "Left",
            type: "int",
            useNull: true
        },
        {
            name: "Right",
            type: "int",
            useNull: true
        }
    ],

    proxy: {
        type: 'slaterecords',
        url: '/locations'
    }
});