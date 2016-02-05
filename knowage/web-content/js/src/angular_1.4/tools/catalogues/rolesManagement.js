var app = angular.module("RolesManagementModule", ["ngMaterial", "angular_list", "angular_table", "sbiModule", "angular_2_col"]);
app.controller("RolesManagementController", ["sbiModule_translate", "sbiModule_restServices", "$scope", "$mdDialog", "$mdToast", "$timeout","sbiModule_messaging", RolesManagementFunction]);

function RolesManagementFunction(sbiModule_translate, sbiModule_restServices, $scope, $mdDialog, $mdToast, $timeout,sbiModule_messaging) {

    // VARIABLES

    $scope.showme = false; // flag for showing right side
    $scope.dirtyForm = false; // flag to check for modification
    $scope.disable = false; // flag that disable some role options
    $scope.translate = sbiModule_translate;
    $scope.selectedRole = {}; // main item
    $scope.selectedMeta = {};
    $scope.rolesList = []; // array that hold list of roles
    $scope.authList = [];  
    $scope.listType = []; // list that holds list of domain roles
    $scope.roleMetaModelCategories = [];
    $scope.category = [];
    $scope.rmSpeedMenu = [{
        label: sbiModule_translate.load("sbi.generic.delete"),
        icon: 'fa fa-trash-o fa-lg',
        color: '#153E7E',
        action: function (item, event) {

            $scope.confirmDelete(item,event);
        }
    }];

    $scope.confirm = $mdDialog
        .confirm()
        .title(sbiModule_translate.load("sbi.catalogues.generic.modify"))
        .content(
            sbiModule_translate
            .load("sbi.catalogues.generic.modify.msg"))
        .ariaLabel('toast').ok(
            sbiModule_translate.load("sbi.general.continue")).cancel(
            sbiModule_translate.load("sbi.general.cancel"));
    
    $scope.confirmDelete = function(item,ev) {
	    var confirm = $mdDialog.confirm()
	          .title(sbiModule_translate.load("sbi.catalogues.toast.confirm.title"))
	          .content(sbiModule_translate.load("sbi.catalogues.toast.confirm.content"))
	          .ariaLabel("confirm_delete")
	          .targetEvent(ev)
	          .ok(sbiModule_translate.load("sbi.general.continue"))
	          .cancel(sbiModule_translate.load("sbi.general.cancel"));
	    $mdDialog.show(confirm).then(function() {
            $scope.deleteRole(item);
	    }, function() {
	
	    });
	  };


    // FUNCTIONS

    angular.element(document).ready(function () { // on page load function
    	$scope.getRoles();
    	$scope.getDomainType();
    	$scope.getCategories();
    	
    });
    $scope.roleInit = function(){ // function the inits role object on creation
    	
    	$scope.disable = true;
        $scope.selectedRole.ableToManageGlossaryBusiness= false;
        $scope.selectedRole.ableToManageGlossaryTechnical= false;
        $scope.selectedRole.ableToManageUsers= false;
        $scope.selectedRole.ableToSaveIntoPersonalFolder= true;
        $scope.selectedRole.ableToEnableDatasetPersistence= true;
        $scope.selectedRole.ableToEnableFederatedDataset= true;
        $scope.selectedRole.ableToCreateSocialAnalysis= true;
        $scope.selectedRole.ableToEditMyKpiComm= true;
        $scope.selectedRole.ableToSeeSubobjects= true;
        $scope.selectedRole.ableToBuildQbeQuery= true;
        $scope.selectedRole.ableToSaveSubobjects= true;
        $scope.selectedRole.ableToSaveRememberMe= true;
        $scope.selectedRole.ableToSendMail= true;
        $scope.selectedRole.ableToSeeFavourites= true;
        $scope.selectedRole.ableToSaveMetadata= true;
        $scope.selectedRole.ableToSeeViewpoints= true;
        $scope.selectedRole.ableToSeeNotes= true;
        $scope.selectedRole.ableToSeeSnapshots= true;
        $scope.selectedRole.ableToDoMassiveExport= true;
        $scope.selectedRole.ableToCreateDocuments= true;
        $scope.selectedRole.ableToEditWorksheet= true;
        $scope.selectedRole.ableToHierarchiesManagement= true;
        $scope.selectedRole.ableToEditAllKpiComm= true;
        $scope.selectedRole.ableToSeeDocumentBrowser= true;
        $scope.selectedRole.ableToSeeSubscriptions= true;
        $scope.selectedRole.ableToSeeMyData= true;
        $scope.selectedRole.ableToSeeMetadata= true;
        $scope.selectedRole.ableToSeeToDoList= true;
        $scope.selectedRole.ableToViewSocialAnalysis= true;
        $scope.selectedRole.ableToDeleteKpiComm= true;	
    }

    $scope.setDirty = function () {
        $scope.dirtyForm = true;
    }
    
    /*
     * 	function that checks if role is "USER" and enables user available choices
	 *	also assigns Domain Type values to main item on change																
     */
    $scope.changeType = function(item) {
    	console.log(item);
		for (var i = 0; i < $scope.listType.length; i++) {
			if($scope.listType[i].VALUE_CD == item){
				$scope.selectedRole.roleTypeID=$scope.listType[i].VALUE_ID;
			}
		}
		 if ($scope.selectedRole.roleTypeCD == "USER") {
	        	$scope.disable = false;	
			}else{
				$scope.disable = true;
			}
		
	}
    
    /*
     * 	function that adds VALUE_TR property to each Domain Type
     *  object because of internalization																	
     */
    $scope.addTranslation = function() {
		
    	 for ( var l in $scope.listType) {
 			switch ($scope.listType[l].VALUE_CD) {
 			case "USER":
 			$scope.listType[l].VALUE_TR = sbiModule_translate.load("sbidomains.nm.user");
 			break;	
 			case "ADMIN":
 			$scope.listType[l].VALUE_TR = sbiModule_translate.load("sbidomains.nm.admin");
 			break;	
 			case "DEV_ROLE":
 			$scope.listType[l].VALUE_TR = sbiModule_translate.load("sbidomains.nm.dev_role");
 			break;	
 			case "TEST_ROLE":
 			$scope.listType[l].VALUE_TR = sbiModule_translate.load("sbidomains.nm.test_role");
 			break;	
 			case "MODEL_ADMIN":
 			$scope.listType[l].VALUE_TR = sbiModule_translate.load("sbidomains.nm.model_admin");
 			break;	
 			default:
 			break;
 			}
 		}
    	
	}
    
    /*
     * 	this function is used to properly format
     *  selected roles categories
     *  for adding or updating.
     *  																	
     */
    $scope.formatCategories = function () {
        
       if ($scope.category.length > 0) {
    	  
    	   var tmpR = []; 
    	   for (var i = 0; i < $scope.category.length; i++) {
          	 $scope.selectedMeta={};
          	$scope.selectedMeta.categoryId=$scope.category[i].VALUE_ID;
          	tmpR.push($scope.selectedMeta);
          }
          	$scope.selectedRole.roleMetaModelCategories = tmpR;
		
       }else{
    	
    	   delete $scope.selectedRole.roleMetaModelCategories;
       }
    	}
    
    
    /*
     * 	this function is used to properly fill
     *  categories table with categories from
     *  selected role																	
     */
    $scope.setCetegories = function(data) {
    	if (data.length>0) {
			$scope.category = [];
	        for (var i = 0; i < $scope.roleMetaModelCategories.length; i++) {
	            for (var j = 0; j < data.length; j++) {
	                if (data[j].categoryId == $scope.roleMetaModelCategories[i].VALUE_ID) {
	                    $scope.category.push($scope.roleMetaModelCategories[i]);
	                }
	            }
	        }
		}else{
			$scope.category = [];
		}	
	}
        
    /*
     * 	this function is called when item
     *  from table is clicked																	
     */
    $scope.loadRole = function (item) {
    	$scope.getCategoriesByID(item);
    	
    	
        if ($scope.dirtyForm) {
            $mdDialog.show($scope.confirm).then(function () {
                $scope.dirtyForm = false;
                $scope.selectedRole = angular.copy(item);
                $scope.showme = true;
            }, function () {
                $scope.showme = true;
            });

        } else {

        	$scope.selectedRole = angular.copy(item);
            $scope.showme = true;
        }
        if ($scope.selectedRole.roleTypeCD == "USER") {
        	$scope.disable = false;	
		}else{
			$scope.disable = true;
		}   
    }
    
    $scope.cancel = function () { // on cancel button
    	$scope.selectedRole = {};
    	$scope.category = [];
        $scope.showme = false;
        $scope.dirtyForm = false;
    }
    
    /*
     * 	this function is called when clicking
     *  on plus button(create)																	
     */
    $scope.createRole = function () {
    	$scope.selectedRole = {};
    	$scope.category = [];
        if ($scope.dirtyForm) {
            $mdDialog.show($scope.confirm).then(function () {	
            	
                $scope.dirtyForm = false;
                $scope.roleInit();
                $scope.showme = true;
                
            }, function () {
            	
                $scope.showme = true;
                
            });

        } else {
        	$scope.roleInit();
            $scope.showme = true;
        }
    }
    
    /*
     * 	this function is called when clicking
     *  on save button.
     *  If item already exists do update @PUT,
     *  If item dont exists insert new one @POST
     *  																
     */
    $scope.saveRole = function () {
    	$scope.formatCategories();
    	console.log($scope.selectedRole.roleMetaModelCategories);
        if($scope.selectedRole.hasOwnProperty("id")){
        	
        	sbiModule_restServices.promisePut("2.0/roles", $scope.selectedRole.id , $scope.selectedRole)
    		.then(function(response) {
    			$scope.rolesList = [];
				$timeout(function(){								
					$scope.getRoles();
				}, 1000);
				sbiModule_messaging.showSuccessMessage(sbiModule_translate.load("sbi.catalogues.toast.updated"), 'Success!');
				$scope.selectedRole = {};
				$scope.showme=false;
				$scope.dirtyForm=false;	
    		}, function(response) {
    			sbiModule_messaging.showErrorMessage(response.data.errors[0].message, 'Error');
    			
    		});
						
		}else{
			
			sbiModule_restServices.promisePost("2.0/roles","",angular.toJson($scope.selectedRole, true))
    		.then(function(response) {
    			$scope.rolesList=[];
				$timeout(function(){								
					$scope.getRoles();
				}, 1000);
				sbiModule_messaging.showSuccessMessage(sbiModule_translate.load("sbi.catalogues.toast.created"), 'Success!');
				$scope.selectedRole = {};
				$scope.showme=false;
				$scope.dirtyForm=false;
    		}, function(response) {
    			sbiModule_messaging.showErrorMessage(response.data.errors[0].message, 'Error');
    			
    		});
		}
    }
    
    $scope.getRoles = function () { // service that gets list of roles GET
    	
    	sbiModule_restServices.promiseGet("2.0", "roles")
		.then(function(response) {
			$scope.rolesList = response.data;
		}, function(response) {
			sbiModule_messaging.showErrorMessage(response.data.errors[0].message, 'Error');
			
		});
    }
    
    /*
     * 	service that gets domain types for
     *  dropdown @GET																	
     */
    $scope.getDomainType = function(){	
    	
    	sbiModule_restServices.promiseGet("domains", "listValueDescriptionByType","DOMAIN_TYPE=ROLE_TYPE")
		.then(function(response) {
			$scope.listType = response.data;
			$scope.addTranslation();
		}, function(response) {
			sbiModule_messaging.showErrorMessage(response.data.errors[0].message, 'Error');
			
		});
	}
    
    /*
     * 	service that gets domain types for
     *  categories @GET																	
     */
    $scope.getCategories = function(){	
    	
    	sbiModule_restServices.promiseGet("domains","listValueDescriptionByType","DOMAIN_TYPE=BM_CATEGORY")
		.then(function(response) {
			$scope.roleMetaModelCategories = response.data;
			
		}, function(response) {
			sbiModule_messaging.showErrorMessage(response.data.errors[0].message, 'Error');
			
		});
	}
    
    /*
     * 	service that gets loaded categories
     *  for selected role @GET																	
     */
    $scope.getCategoriesByID = function(item){
    	
    	sbiModule_restServices.promiseGet("2.0/roles/categories", item.id)
		.then(function(response) {
			$scope.setCetegories(response.data);
			
		}, function(response) {
			sbiModule_messaging.showErrorMessage(response.data.errors[0].message, 'Error');
			
		});
	}
    
    /*
     * 	this function is called when
     *  clicking on delete button @DELETE																	
     */
    $scope.deleteRole = function (item) { 
    	
    	sbiModule_restServices.promiseDelete("2.0/roles", item.id)
		.then(function(response) {
			$scope.rolesList = [];
            $timeout(function () {
                $scope.getRoles();
            }, 1000);
            sbiModule_messaging.showSuccessMessage(sbiModule_translate.load("sbi.catalogues.toast.deleted"), 'Success!');
            $scope.selectedRole = {};
            $scope.showme = false;
            $scope.dirtyForm = false;

		}, function(response) {
			sbiModule_messaging.showErrorMessage(response.data.errors[0].message, 'Error');
			
		});
    }
};
