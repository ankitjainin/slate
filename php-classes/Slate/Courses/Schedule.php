<?php

namespace Slate\Courses;

use HandleBehavior;

class Schedule extends \VersionedRecord
{
    // VersionedRecord configuration
    public static $historyTable = 'history_course_schedules';

    // ActiveRecord configuration
    public static $tableName = 'course_schedules';
    public static $singularNoun = 'course schedule';
    public static $pluralNoun = 'course schedules';
    public static $collectionRoute = '/schedules';

    // required for shared-table subclassing support
    public static $rootClass = __CLASS__;
    public static $defaultClass = __CLASS__;
    public static $subClasses = array(__CLASS__);

    public static $fields = array(
        'Title' => array(
            'fulltext' => true
            ,'notnull' => false
        )
        ,'Handle' => array(
            'unique' => true
            ,'notnull' => false
        )

        ,'Status' => array(
            'type' => 'enum'
            ,'values' => array('Hidden','Live','Deleted')
            ,'default' => 'Live'
        )

        ,'Description' => array(
            'type' => 'clob'
            ,'fulltext' => true
            ,'notnull' => false
        )
    );

    public static $validators = [
        'Title' => [
            'errorMessage' => 'A title is required',
            'required' => false
        ]
    ];

    public static $relationships = array(
        'Blocks' => array(
            'type' => 'one-many'
            ,'class' => ScheduleBlock::class
        )
    );


    public static function getOrCreateByHandle($handle)
    {
        if ($Schedule = static::getByHandle($handle)) {
            return $Schedule;
        } else {
            return static::create(array(
                'Title' => $handle
                ,'Handle' => $handle
            ), true);
        }
    }

    public function validate($deep = true)
    {
        // call parent
        parent::validate();

        // implement handles
        HandleBehavior::onValidate($this, $this->_validator);

        // save results
        return $this->finishValidation();
    }

    public function save($deep = true)
    {
        // implement handles
        HandleBehavior::onSave($this);

        // call parent
        parent::save($deep);
    }
}