<?php

class PlayControllerTest extends ControllerTestCase {
    private static $uid;
    private static $root;

    public function setUp() {
        parent::setUp();
        $user = User::createTmp();
        $sess = new Zend_Session_Namespace('auth');
        $sess->user = $user->toArray();
        self::$uid = $user->id;
        self::$root = $user->roottask_id;
    }

    public function testInsertTask() {
        $this->request
            ->setMethod('POST')
            ->setPost(array(
                           'data' => array(
                               array(
                                   'act' => 'i',
                                   'task' => array(
                                       'id' => -1,
                                       'label' => 'New Task',
                                       'x' => 100,
                                       'y' => 100,
                                       'marked' => 'false',
                                       'parent' => self::$root,
                                       'tid' => 't1'
                                   )
                               )
                           )
                      ));
        $this->dispatch("/play/update");
        $this->assertController("play");
        $this->assertAction("update");
        $this->assertResponseCode(200);
        $this->assertNotRedirect();
        $this->assertEmpty($this->getResponse()->getException());

        $rdata = Zend_Json::decode($this->getResponse()->getBody());
        $this->assertNotNull($rdata);
        $rdata = $rdata[0];
        $this->assertNotNull($rdata);
        $this->assertEquals(array(
                                 'type' => 'i',
                                 'o' => 't1',
                                 'n' => self::$root + 1
                            ), $rdata);

        $task = Doctrine_Core::getTable('Task')->find($rdata['n']);
        $this->assertNotNull($task);
        $this->assertInstanceOf('Task', $task);
        // TODO Add Creation/Modification functionality
        //        $this->assertNotNull($task->creation);
        //        $this->assertNotNull($task->modification);
        $task = $task->toArray();
        unset($task['creation']);
        unset($task['modification']);
        $this->assertEquals(array(
                                 'id' => self::$root + 1,
                                 'label' => 'New Task',
                                 'complete' => false,
                                 'x' => 100,
                                 'y' => 100,
                                 'page' => false,
                                 'dropped' => false,
                                 'parent_id' => self::$root,
                                 'owner_id' => self::$uid
                            ), $task);
    }

    public function testUpdateTask() {
        require_once APPLICATION_PATH . '/controllers/AuthController.php';

        $task = AuthController::getUser()->addTask();
        $task->label = 'AAA';
        $task->complete = false;
        $task->x = 100;
        $task->y = 100;
        $task->page = false;
        $task->parent_id = self::$root;
        $task->save();

        $tid = $task->id;
        $this->request
            ->setMethod('POST')
            ->setPost(array(
                           'data' => array(
                               array(
                                   'act' => 'u',
                                   'task' => array(
                                       'id' => $tid,
                                       'label' => 'BBB',
                                       'x' => 200,
                                       'y' => 200,
                                       'marked' => 'true',
                                       'parent' => self::$root, //TODO Add modification check
                                       'page' => 'true'
                                   )
                               )
                           )
                      ));
        $this->dispatch("/play/update");
        $this->assertController("play");
        $this->assertAction("update");
        $this->assertResponseCode(200);
        $this->assertNotRedirect();
        $this->assertEmpty($this->getResponse()->getException());

        $rdata = Zend_Json::decode($this->getResponse()->getBody());
        $this->assertNotNull($rdata);
        $rdata = $rdata[0];
        $this->assertNotNull($rdata);
        $this->assertEquals(array(
                                 'type' => 'u',
                                 'id' => $tid
                            ), $rdata);
        $task = Doctrine_Core::getTable('Task')->find($tid);
        $this->assertNotNull($task);
        $this->assertInstanceOf('Task', $task);
        $task = $task->toArray();
        unset($task['creation']);
        unset($task['modification']);
        $this->assertEquals(array(
                                 'id' => $tid,
                                 'label' => 'BBB',
                                 'complete' => true,
                                 'x' => 200,
                                 'y' => 200,
                                 'page' => true,
                                 'dropped' => false,
                                 'parent_id' => self::$root,
                                 'owner_id' => self::$uid
                            ), $task);
    }

    public function testDeleteTask() {
        require_once APPLICATION_PATH . '/controllers/AuthController.php';

        $task = AuthController::getUser()->addTask();
        $task->label = 'AAA';
        $task->complete = false;
        $task->x = 100;
        $task->y = 100;
        $task->page = false;
        $task->parent_id = self::$root;
        $task->save();

        $tid = $task->id;
        $this->request
            ->setMethod('POST')
            ->setPost(array(
                           'data' => array(
                               array(
                                   'act' => 'd',
                                   'id' => $tid
                               )
                           )
                      ));
        $this->dispatch("/play/update");
        $this->assertController("play");
        $this->assertAction("update");
        $this->assertResponseCode(200);
        $this->assertNotRedirect();
        $this->assertEmpty($this->getResponse()->getException());

        $rdata = Zend_Json::decode($this->getResponse()->getBody());
        $this->assertNotNull($rdata);
        $rdata = $rdata[0];
        $this->assertNotNull($rdata);
        $this->assertEquals(array(
                                 'type' => 'd',
                                 'id' => $tid
                            ), $rdata);
        $task = Doctrine_Core::getTable('Task')->find($tid);
        $this->assertFalse($task);
    }

    public function testIndexAction() {
        $this->dispatch("/play/index");
        $this->assertController("play");
        $this->assertAction("index");
        $this->assertResponseCode(200);
    }

    public function testTaskPageAction() {
        require_once APPLICATION_PATH . '/controllers/AuthController.php';

        $task = AuthController::getUser()->addTask();
        $task->label = 'AAA';
        $task->complete = false;
        $task->x = 100;
        $task->y = 100;
        $task->page = true;
        $task->parent_id = self::$root;
        $task->save();

        $tid = $task->id;

        $task = AuthController::getUser()->addTask();
        $task->label = 'BBB';
        $task->complete = false;
        $task->x = 200;
        $task->y = 200;
        $task->page = false;
        $task->parent_id = $tid;
        $task->save();

        $tid2=$task->id;

        $this->dispatch("/play/get-task-page/id/$tid");
        $this->assertController("play");
        $this->assertAction("get-task-page");
        $this->assertResponseCode(200);
        $this->assertNotRedirect();
        $this->assertEmpty($this->getResponse()->getException());

        $rdata = Zend_Json::decode($this->getResponse()->getBody());
        $this->assertNotNull($rdata);

        $this->assertEquals(array(array(
                'id'    =>  $tid2,
                'label' =>  'BBB',
                'x'     =>  200,
                'y'     =>  200,
                'marked'=>  false,
                'subs'  =>  array()
          )), $rdata);
    }

    public function testTaskPageWithoutIdAction(){
        require_once APPLICATION_PATH . '/controllers/AuthController.php';

        $task = AuthController::getUser()->addTask();
        $task->label = 'AAA';
        $task->complete = false;
        $task->x = 100;
        $task->y = 100;
        $task->page = true;
        $task->parent_id = self::$root;
        $task->save();

        $tid = $task->id;

        $this->dispatch("/play/get-task-page");
        $this->assertController("play");
        $this->assertAction("get-task-page");
        $this->assertResponseCode(200);
        $this->assertNotRedirect();
        $this->assertEmpty($this->getResponse()->getException());

        $rdata = Zend_Json::decode($this->getResponse()->getBody());
        $this->assertNotNull($rdata);

        $this->assertEquals(array(array(
                'id'    =>  $tid,
                'label' =>  'AAA',
                'x'     =>  100,
                'y'     =>  100,
                'marked'=>  false,
                'subs'  =>  array()
          )), $rdata);
    }
}