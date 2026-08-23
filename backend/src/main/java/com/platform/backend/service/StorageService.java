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

    // Permanently removes the stored file (and its GridFS chunks) so a
    // deleted document doesn't leave orphaned binary data behind.
    public void delete(String fileId) {
        if (fileId == null || fileId.isBlank()) {
            return;
        }
        ObjectId objectId;
        try {
            objectId = new ObjectId(fileId);
        } catch (IllegalArgumentException e) {
            // Not a valid id — nothing to delete, same defensive stance as retrieve().
            return;
        }
        gridFsTemplate.delete(Query.query(Criteria.where("_id").is(objectId)));
    }
}