
ttApp = angular.module('ttApp', []).
        filter('stripCommas', function() {
            return function(text) {
                if (typeof text !== 'undefined')
                {// conditional based on optional argument
                    return text.replace(/\,/g, '##comma##');
                }
            };
        });


function ttFormCntrl($scope, $http, $compile, $filter) {

    // DECLARE OBJECTS

    function XmlWrapper() { // XML BASE
        self = this;
        this._tag = '';
        this._additional = '';
        this._val = '';
        this.subObjects = [];
        this.toString = function() { // toString BASE
            text = '<' + this._tag + ' ' + this._additional + '>' + this._val + '</' + this._tag + '>\n'; 
            return text;
        };
    }
    ;

    XmlWrapper.prototype.tag = function(_) {
        if (!arguments.length)
            return this._tag;
        this._tag = _;
        return this;
    };

    XmlWrapper.prototype.additional = function(_) {
        if (!arguments.length)
            return this._additional;
        this._additional = _;
        return this;
    };

    XmlWrapper.prototype.val = function(_) {
        if (!arguments.length)
            return this._val;
        this._val = _;
        return this;
    };

    function StixStatement() {
        this.value = new XmlWrapper().tag('stixCommon:Value').additional('xsi:type="stixVocabs:IntendedEffectVocab-1.0"');
        this.description = new XmlWrapper().tag('stixCommon:Description');
        this.confidence = new XmlWrapper().tag('stixCommon:Confidence').additional('vocab_name="CONFIRMED/POSSIBLE/UNKNOWN/DISPROVED"');
        this.toString = function() {
            text = this.value.toString() + this.description.toString() + this.confidence.toString();
            return text;
        };
    }


    function CoaObjective() {
        this.tag = 'COA:Objective';
        this.description = new XmlWrapper().tag('COA:Description');
        this.toString = function() {
            text = '<' + this.tag + '>\n' + this.description.toString() + '</' + this.tag + '>';
            return text;
        };
    }

    function IntendedEffect(scope) {
        this.tag = scope + ':Intended_Effect';
        this.statement = new StixStatement();
        this.toString = function() {
            text = '<' + this.tag + '>\n' + this.statement.toString() + '</' + this.tag + '>';
            return text;
        };
    }

    function AttackPattern(scope) {
        this.capecID = '';
        this.tag = scope + ':Attack_Pattern';
        this.description = new XmlWrapper().tag(scope + ':Description');
        this.id = "";
        this.toString = function() {
            if (this.capecID.value !== '[NOT SPECIFIED]') {
                this.id = ' capec_id="' + this.capecID.id + '"';
            }
            ;
            text = '<' + this.tag + this.id + '>\n' + this.description.toString() + '</' + this.tag + '>';
            return text;
        };
    }

    function TTP() {
        this.tag = 'stix:TTP';
        this.additional = 'xsi:type="ttp:TTPType"';
        this.id = 'ttDemo:ttp-' + generateUUID();
        this.title = new XmlWrapper().tag('ttp:Title');
        this.description = new XmlWrapper().tag('ttp:Description');
        this.intendedEffects = [];
        this.attackPatterns = [];
        this.toString = function() {
            if (this.intendedEffects) {
                ieText = $scope.printGenericEX(this.intendedEffects);
            }
            else
                ieText = "";
            if (this.attackPatterns) {
                apText = '<ttp:Behavior><ttp:Attack_Patterns>' + $scope.printGenericEX(this.attackPatterns) + '</ttp:Attack_Patterns></ttp:Behavior>';
            } else
                apText = '';
            text = '<' + this.tag + ' ' + this.additional + ' id="' + this.id + '">\n' + this.title.toString() + ieText + apText + '</' + this.tag + '>';
            return text;
        };
    }

    function CourseOfAction() {
        this.tag = 'stixCommon:Course_Of_Action';
        this.additional = 'xsi:type="COA:CourseOfActionType"';
        this.id = 'COA-' + generateUUID();
        this.stage = new XmlWrapper().tag('COA:Stage').additional('xsi:type="stixVocabs:COAStageVocab-1.0"');
        this.type = new XmlWrapper().tag('COA:Type');
        this.description = new XmlWrapper().tag('COA:Description');
        this.objective = new CoaObjective();
        this.toString = function() {
            text = '<' + this.tag + ' ' + this.additional + ' id="' + this.id + '">\n' + this.stage.toString() + this.type.toString() + this.description.toString() + this.objective.toString() + '</' + this.tag + '>';
            return text;
        };
    }

    // CONSTANTS AND VARS

    $scope.UUID = "";
    $scope.malwareFileName = "example.zip";
    
    $scope.createUUID = function() {
        $scope.UUID = generateUUID();
    };

    $scope.ieObject = {ieValue: [], ieConfidence: [], ieDescription: [], isEmbedable: false, ieScope: "campaign"};

    $scope.coaObject = {coaStage: [], coaType: [], coaDescription: [], coaObjective: {description: []}};

    $scope.ttpObject = {ttpTitle: [], ttpDescription: [], ttpIntendedEffects: [], ttpAttackPatterns: []};

    $scope.apObject = {apDescription: [], apCapecID: []};

    $scope.intendedEffects = [];

    $scope.COAs = [];

    $scope.TTPs = [];

    $scope.attackPatterns = [];


    // HELPER FUNCTIONS

    $scope.resetToDefault = function() {
        $scope.UUID = "";
        $scope.stixPackageTitle = "";
        $scope.stixDescription = "";
        $scope.creationTimestamp = "";
        $scope.malwareBase64 = "";
        $scope.indicatorValue = "";
        $scope.TTPs = [];
        $scope.COAs = [];
        $scope.intendedEffects = [];
        $scope.attackPatterns = [];
        $scope.ieObject = {ieValue: [], ieConfidence: [], ieDescription: [], isEmbedable: false};
        $scope.coaObject = {coaStage: [], coaType: [], coaDescription: [], coaObjective: {description: []}};
        $scope.ttpObject = {ttpTitle: [], ttpDescription: [], ttpIntendedEffects: [], ttpAttackPatterns: []};
        $scope.apObject = {apDescription: [], apCapecID: []};
    };


    $scope.saveToFile = function() {
        var textToWrite = document.getElementById("stixXML").value;
        var textFileAsBlob = new Blob([textToWrite], {type: 'text/plain'});
        //var fileNameToSaveAs = $scope.UUID + ".xml";
        var fileNameToSaveAs = $scope.documentStatus.value + "-" + $scope.packageIntent.value + "-" + $scope.UUID + ".xml";
        var downloadLink = document.createElement("a");
        downloadLink.download = fileNameToSaveAs;
        downloadLink.innerHTML = "Download File";
        if (window.webkitURL != null)
        {
            // Chrome allows the link to be clicked
            // without actually adding it to the DOM.
            downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
        }
        else
        {
            // Firefox requires the link to be added to the DOM
            // before it can be clicked.
            downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
            downloadLink.onclick = destroyClickedElement;
            downloadLink.style.display = "none";
            document.body.appendChild(downloadLink);
        }
        downloadLink.click();
    }

    $scope.loadFromFile = function() {
        var fileToLoad = document.getElementById("fileToLoad").files[0];

        var fileReader = new FileReader();
        fileReader.onload = function(fileLoadedEvent)
        {
            var textFromFileLoaded = fileLoadedEvent.target.result;
            textFromFileLoaded = replaceIfSubStr(textFromFileLoaded, "base64,");
            $scope.malwareBase64 = textFromFileLoaded;
        };
        fileReader.readAsDataURL(fileToLoad);
    }


    $scope.printGenericEX = function(list) {
        var text = '';
        angular.forEach(list, function(value, key) {
            text = text + value.toString();
        });
        return text;
    };


    $scope.stixXML = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" +
            "<stix:STIX_Package" +
            "    xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\"" +
            "    xmlns:stix=\"http://stix.mitre.org/stix-1\"" +
            "    xmlns:{{branding}}=\"{{brandingNamespace}}\"" +
            "    id=\"{{branding}}:STIXPackage-{{UUID}}\"";


    $scope.newUUID = generateUUID();
    $scope.newUUID2 = generateUUID();
    $scope.newUUID3 = generateUUID();
    $scope.newUUID4 = generateUUID();


    $scope.creationTimestamp = Date.now();
    $scope.branding = "ttDemo";
    $scope.brandingNamespace = "ttDemo";


    // ADDERS
    
    $scope.addIntendedEffect = function() {
        ie = new IntendedEffect($scope.ieObject.ieScope);
        ie.statement.description.val($scope.ieObject.ieDescription);
        ie.statement.value.val($scope.ieObject.ieValue.value);
        ie.statement.confidence.val($scope.ieObject.ieConfidence.value);
        console.log(ie);
        $scope.intendedEffects.push(ie);
    };

    $scope.addCOA = function() {
        coa = new CourseOfAction();
        console.log(coa);
        coa.stage.val($scope.coaObject.coaStage.value);
        coa.type.val($scope.coaObject.coaType);
        coa.description.val($scope.coaObject.coaDescription);
        coa.objective.description.val($scope.coaObject.coaObjective.description);
        $scope.COAs.push(coa);
    };

    $scope.addAttackPattern = function() {
        ap = new AttackPattern("ttp");
        ap.capecID = ($scope.apObject.apCapecID);
        ap.description.val($scope.apObject.apDescription);
        $scope.attackPatterns.push(ap);
    };

    $scope.addTTP = function() {
        ttp = new TTP();
        ttp.title.val($scope.ttpObject.ttpTitle);
        ttp.description.val($scope.ttpObject.ttpDescription);
        if ($scope.attackPatterns.length !== 0) {
            ttp.attackPatterns = $scope.attackPatterns;
        }
        else
            ttp.attackPatterns = false;
        if ($scope.intendedEffects.length !== 0) {
            ttp.intendedEffects = $scope.intendedEffects;
        } else
            ttp.intendedEffects = false;
        $scope.TTPs.push(ttp);
        $scope.attackPatterns = [];
        $scope.intendedEffects = [];
    };


    $scope.generateBody = function() {
        text = $scope.printXMLHeader() + $scope.printSTIXHeader();
        text = text + $scope.printGenericEX($scope.COAs);
        text = text + $scope.printGenericEX($scope.intendedEffects);
        text = text + "</stix:STIX_Package>";
        return vkbeautify.xml(text);
    };

    $scope.generateBodyTTP = function() {
        text = $scope.printXMLHeader() + $scope.printSTIXHeader();
        text = text + $scope.printGenericEX($scope.TTPs);
        text = text + "</stix:STIX_Package>";
        return vkbeautify.xml(text);
    };


    $scope.printXMLHeader = function() { // TODO: MAKE DYNAMIC
        header = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>' + '\n' +
                '<stix:STIX_Package' + '\n' +
                'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"' + '\n' +
                'xmlns:stix="http://stix.mitre.org/stix-1"' + '\n' +
                'xmlns:indicator="http://stix.mitre.org/Indicator-2"' + '\n' +
                'xmlns:cybox="http://cybox.mitre.org/cybox-2"' + '\n' +
                'xmlns:AddressObject="http://cybox.mitre.org/objects#AddressObject-2"' + '\n' +
                'xmlns:stixCommon="http://stix.mitre.org/common-1"' + '\n' +
                'xmlns:cyboxCommon="http://cybox.mitre.org/common-2"' + '\n' +
                'xmlns:stixVocabs="http://stix.mitre.org/default_vocabularies-1"' + '\n' +
                'xmlns:cyboxVocabs="http://cybox.mitre.org/default_vocabularies-2"' + '\n' +
                'xmlns:ttp="http://stix.mitre.org/TTP-1"' + '\n' +
                'xmlns:ttDemo="ttDemo"' + '\n' + 
                'xsi:schemaLocation="' + '\n' +
                '\thttp://stix.mitre.org/stix-1 ../stix_core.xsd' + '\n' +
                '\thttp://stix.mitre.org/Indicator-2 ../indicator.xsd' + '\n' +
                '\thttp://cybox.mitre.org/default_vocabularies-2 ../cybox/cybox_default_vocabularies.xsd' + '\n' +
                '\thttp://stix.mitre.org/default_vocabularies-1 ../stix_default_vocabularies.xsd' + '\n' +
                '\thttp://cybox.mitre.org/objects#AddressObject-2 ../cybox/objects/Address_Object.xsd' + '\n' +
                '\thttp://cybox.mitre.org/cybox-2 ../cybox/cybox_core.xsd' + '\n' +
                '\thttp://cybox.mitre.org/common-2 ../cybox/cybox_common.xsd"' + '\n' +
                '\tid="ttDemo:STIXPackage-"' + '\n' +
                '\tversion="1.0.1">';
        return header;
    };

    $scope.printSTIXHeader = function() {
        header = '<stix:STIX_Header>' +
                '<stix:Title>' + $scope.stixPackageTitle + '</stix:Title>' +
                '<stix:Package_Intent xsi:type="stixVocabs:PackageIntentVocab-1.0">' + $scope.packageIntent.value + '</stix:Package_Intent>' +
                '<stix:Information_Source>' + 
                '<stixCommon:Time>' +
                '<cyboxCommon:Produced_Time>' + $filter('date')($scope.creationTimestamp, 'yyyy-MM-ddTHH:mm:ssZ') + '</cyboxCommon:Produced_Time>' +
                '</stixCommon:Time>' +
                '</stix:Information_Source>' + 
                '</stix:STIX_Header>';
        return header;
    };





    $scope.ttpCount = function() {
        count = $scope.TTPs.length;
        return count;
    };

    $scope.apCount = function() {
        count = $scope.attackPatterns.length;
        return count;
    };



    $scope.ieCount = function() {
        count = $scope.intendedEffects.length;
        return count;
    };

    $scope.coaCount = function() {
        count = $scope.COAs.length;
        return count;
    };



    $scope.printIntendedEffectEX = function() {
        var text = '';
        angular.forEach($scope.intendedEffects, function(value, key) {
            text = text + value.toString();
        });
        return text;
    };


    $scope.printIntendedEffect = function() {
        var text = '';
        angular.forEach($scope.intendedEffects, function(value, key) {
            if (value.openTag) {
                text = text + '\t<' + value.openTag + '>\n';
            }
            if (value.closeTag) {
                text = text + '\t</' + value.closeTag + '>\n';
            }
            if (value.tag) {
                additional = value.additional ? " " + value.additional : "";
                text = text + '\t\t<' + value.tag + additional + '>' + value.val + '</' + value.tag + '>\n';
            }
        });
        return text;
    };






    // LOAD ALL ENUM

    $scope.confidenceEnum =
            [
                {"value": "CONFIRMED"},
                {"value": "POSSIBLE"},
                {"value": "UNKNOWN"},
                {"value": "DISPROVED"}
            ];

    $scope.ieObject.ieConfidence = $scope.confidenceEnum[1];

    $scope.documentStatuses =
            [
                {"value": "Draft"},
                {"value": "Final"}
            ];

    $scope.documentStatus = $scope.documentStatuses[0];

    $http.get('js/controllers/json/packageIntent.json')
            .then(function(res) {
                $scope.packageIntents = res.data;
                $scope.packageIntent = $scope.packageIntents[8]; //set the default value
            });

    $http.get('js/controllers/json/defaultSeverities.json')
            .then(function(res) {
                $scope.defaultSeverities = res.data;
            });

    $http.get('js/controllers/json/malwareTypes.json')
            .then(function(res) {
                $scope.malwareTypes = res.data;
            });

    $http.get('js/controllers/json/indicatorTypes.json')
            .then(function(res) {
                $scope.indicatorTypes = res.data;
                $scope.indicatorType = $scope.indicatorTypes[1];
            });

    $http.get('js/controllers/json/coaStages.json')
            .then(function(res) {
                $scope.coaStages = res.data;
                $scope.coaObject.coaStage = $scope.coaStages[0];
            });

    $http.get('js/controllers/json/campaignStatus.json')
            .then(function(res) {
                $scope.campaignStatus = res.data;
            });

    $http.get('js/controllers/json/incidentStatus.json')
            .then(function(res) {
                $scope.incidentStatus = res.data;
            });

    $http.get('js/controllers/json/securityCompromise.json')
            .then(function(res) {
                $scope.securityCompromise = res.data;
            });

    $http.get('js/controllers/json/discoveryMethods.json')
            .then(function(res) {
                $scope.discoveryMethods = res.data;
            });

    $http.get('js/controllers/json/availabilityLoss.json')
            .then(function(res) {
                $scope.availabilityLoss = res.data;
            });

    $http.get('js/controllers/json/lossDuration.json')
            .then(function(res) {
                $scope.lossDuration = res.data;
            });

    $http.get('js/controllers/json/ownershipClass.json')
            .then(function(res) {
                $scope.ownershipClass = res.data;
            });

    $http.get('js/controllers/json/managementClass.json')
            .then(function(res) {
                $scope.managementClass = res.data;
            });

    $http.get('js/controllers/json/locationClass.json')
            .then(function(res) {
                $scope.locationClass = res.data;
            });

    $http.get('js/controllers/json/impactQualification.json')
            .then(function(res) {
                $scope.impactQualification = res.data;
            });

    $http.get('js/controllers/json/impactRating.json')
            .then(function(res) {
                $scope.impactRating = res.data;
            });

    $http.get('js/controllers/json/assetType.json')
            .then(function(res) {
                $scope.assetType = res.data;
            });

    $http.get('js/controllers/json/attackerInfrastructure.json')
            .then(function(res) {
                $scope.attackerInfrastructure = res.data;
            });

    $http.get('js/controllers/json/systemType.json')
            .then(function(res) {
                $scope.systemType = res.data;
            });

    $http.get('js/controllers/json/informationType.json')
            .then(function(res) {
                $scope.informationType = res.data;
            });

    $http.get('js/controllers/json/motivationType.json')
            .then(function(res) {
                $scope.motivationType = res.data;
            });

    $http.get('js/controllers/json/intendedEffectsEnum.json')
            .then(function(res) {
                $scope.intendedEffectsEnum = res.data;
                $scope.ieObject.ieValue = $scope.intendedEffectsEnum[0];
            });

    $http.get('js/controllers/json/capecIDEnum.json')
            .then(function(res) {
                $scope.capecIDEnum = res.data;
                $scope.apObject.apCapecID = $scope.capecIDEnum[0];
            });

    $http.get('js/controllers/json/planningOperationalSupport.json')
            .then(function(res) {
                $scope.planningOperationalSupport = res.data;
            });

    $http.get('js/controllers/json/incidentEffect.json')
            .then(function(res) {
                $scope.incidentEffect = res.data;
            });

    $http.get('js/controllers/json/attackToolType.json')
            .then(function(res) {
                $scope.attackToolType = res.data;
            });

    $http.get('js/controllers/json/incidentCategory.json')
            .then(function(res) {
                $scope.incidentCategory = res.data;
            });

    $http.get('js/controllers/json/lossProperty.json')
            .then(function(res) {
                $scope.lossProperty = res.data;
            });
   
}

