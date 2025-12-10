package com.devhelper.controller;

import com.devhelper.dto.XmlFormatRequest;
import com.devhelper.dto.XmlFormatResponse;
import org.springframework.web.bind.annotation.*;
import org.w3c.dom.Document;
import org.xml.sax.InputSource;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import java.io.StringReader;
import java.io.StringWriter;

@RestController
@RequestMapping("/api/xml")
public class XmlController {

    @PostMapping("/format")
    public XmlFormatResponse formatXml(@RequestBody XmlFormatRequest request) {
        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            DocumentBuilder builder = factory.newDocumentBuilder();
            Document doc = builder.parse(new InputSource(new StringReader(request.getXml())));

            TransformerFactory transformerFactory = TransformerFactory.newInstance();
            Transformer transformer = transformerFactory.newTransformer();
            transformer.setOutputProperty(OutputKeys.INDENT, "yes");
            transformer.setOutputProperty("{http://xml.apache.org/xslt}indent-amount",
                String.valueOf(request.getIndent() != null ? request.getIndent() : 2));
            transformer.setOutputProperty(OutputKeys.OMIT_XML_DECLARATION, "no");

            StringWriter writer = new StringWriter();
            transformer.transform(new DOMSource(doc), new StreamResult(writer));

            return XmlFormatResponse.builder()
                    .formatted(writer.toString())
                    .valid(true)
                    .build();
        } catch (Exception e) {
            return XmlFormatResponse.builder()
                    .formatted(request.getXml())
                    .valid(false)
                    .error(e.getMessage())
                    .build();
        }
    }

    @PostMapping("/validate")
    public XmlFormatResponse validateXml(@RequestBody XmlFormatRequest request) {
        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            DocumentBuilder builder = factory.newDocumentBuilder();
            builder.parse(new InputSource(new StringReader(request.getXml())));

            return XmlFormatResponse.builder()
                    .formatted(request.getXml())
                    .valid(true)
                    .build();
        } catch (Exception e) {
            return XmlFormatResponse.builder()
                    .formatted(request.getXml())
                    .valid(false)
                    .error(e.getMessage())
                    .build();
        }
    }
}

