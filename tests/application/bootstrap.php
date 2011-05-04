<?php
define('APPLICATION_ENV', 'testing');

// Define path to application directory
defined('APPLICATION_PATH')
    || define('APPLICATION_PATH', realpath(dirname(__FILE__) . '/../../application'));

// Ensure library/ is on include_path
set_include_path(implode(PATH_SEPARATOR, array(
    realpath(APPLICATION_PATH . '/../lib'),
    get_include_path(),
)));

/** Zend_Application */
require_once 'Zend/Application.php';
require_once 'Zend/Config/Ini.php';
require_once 'Zend/Registry.php';

$config = new Zend_Config_Ini(APPLICATION_PATH.'/configs/application.ini', APPLICATION_ENV);
Zend_Registry::set('config',$config);

require_once 'Doctrine.php';
spl_autoload_register(array('Doctrine', 'autoload'));		
Doctrine_Manager::connection($config->db->dsn);
Doctrine::loadModels(APPLICATION_PATH.'/models/',Doctrine_Core::MODEL_LOADING_AGGRESSIVE);

require_once 'ControllerTestCase.php';