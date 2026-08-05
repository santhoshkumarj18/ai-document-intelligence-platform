package com.platform.backend.service;

import lombok.RequiredArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.gridfs.GridFsResource;
import org.springframework.data.mongodb.gridfs.GridFsTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class StorageService {

    private final GridFsTemplate gridFsTemplate;

    public String store(MultipartFile file) throws IOException {
        Object fileId = gridFsTemplate.store(
                file.getInputStream(),
                file.getOriginalFilename(),
                file.getContentType()
        );
        return fileId.toString();
    }

    public Optional<GridFsResource> retrieve(String fileId) {
        ObjectId objectId;
        try {
            objectId = new ObjectId(fileId);
        } catch (IllegalArgumentException e) {
            // Not a valid ObjectId hex string at all — treat as "not found"
            // rather than letting a malformed ID crash into a 500.
            return Optional.empty();
        }

        var gridFsFile = gridFsTemplate.findOne(
                Query.query(Criteria.where("_id").is(objectId))
        );

        if (gridFsFile == null) {
            return Optional.empty();
        }

        return Optional.of(gridFsTemplate.getResource(gridFsFile));
    }
}