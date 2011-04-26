<?php

class User extends BaseUser
{
    const ROLE_TEMP = 0;
    const ROLE_MAIN = 1;
    const ROLE_ADMIN = 2;

    public function __constructor(){
        $this->Roottask = new Task($this);
    }
}