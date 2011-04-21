<?php

class DoctrineController extends Zend_Controller_Action {

    public function init() {
        $this->options = array('packagesPrefix' => 'ts_',
                               'packagesPath' => '',
                               'packagesFolderName' => 'packages',
                               'suffix' => '.php',
                               'generateBaseClasses' => true,
                               'baseClassesPrefix' => 'Base',
                               'baseClassesDirectory' => 'gen',
                               'baseClassName' => 'Doctrine_Record'
        );
        Doctrine::debug(true);
    }

    public function indexAction() {
    }

    public function migrInitAction() {
        $this->_helper->viewRenderer->setNoRender();
        Doctrine::generateMigrationsFromModels(
            APPLICATION_PATH . '/models/migration/',
                APPLICATION_PATH . '/models/'
        );
    }

    public function genModelsAction() {
        $this->_helper->viewRenderer->setNoRender();
        echo "Gen Models!<br>";
        Doctrine::generateModelsFromYaml(
            APPLICATION_PATH . '/models/yaml/model.yml',
                APPLICATION_PATH . '/models/',
            $this->options);
    }

    public function showAction() {
        $this->_helper->viewRenderer->setNoRender();
        $migration = new Doctrine_Migration(APPLICATION_PATH . '/models/migration/');
        echo $migration->getCurrentVersion();
    }

    public function migrateAction() {
        $this->_helper->viewRenderer->setNoRender();
        $migration = new Doctrine_Migration(APPLICATION_PATH . '/models/migration/');
        $migration->migrate();
    }

    public function diffAction() {
        $this->_helper->viewRenderer->setNoRender();
        Doctrine::generateMigrationsFromDiff(
            APPLICATION_PATH . '/models/migration/',
                APPLICATION_PATH . '/models/yaml/previous.yml',
                APPLICATION_PATH . '/models/yaml/model.yml'
        );
    }
}